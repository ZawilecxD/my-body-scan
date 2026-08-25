import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { BodyCloseUpMap } from '@/components/body-close-up-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { listOpenInjuries, listOpenInjuriesForLandmark } from '@/db/injuries';
import type { Injury } from '@/domain/injury';
import { REGION_ORDER, type Region, type Side } from '@/domain/landmarks';
import { useTheme } from '@/hooks/use-theme';

function parseRegion(value: string | undefined): Region | null {
  if (value == null) {
    return null;
  }
  return REGION_ORDER.includes(value as Region) ? (value as Region) : null;
}

function parseSide(value: string | undefined): Side | null {
  if (value === 'front' || value === 'back') {
    return value;
  }
  return null;
}

function regionLabel(region: Region): string {
  return region.charAt(0).toUpperCase() + region.slice(1);
}

export default function MapRegionScreen() {
  const { region: regionParam, side: sideParam } = useLocalSearchParams<{
    region?: string | string[];
    side?: string | string[];
  }>();
  const regionValue = Array.isArray(regionParam) ? regionParam[0] : regionParam;
  const sideValue = Array.isArray(sideParam) ? sideParam[0] : sideParam;
  const region = parseRegion(regionValue);
  const side = parseSide(sideValue);

  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [injuries, setInjuries] = useState<Injury[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (region == null || side == null) {
        return;
      }

      let cancelled = false;
      listOpenInjuries(db)
        .then((rows) => {
          if (!cancelled) {
            setError(null);
            setInjuries(rows);
          }
        })
        .catch((caught: unknown) => {
          if (!cancelled) {
            setError(caught instanceof Error ? caught.message : 'Cannot load open injuries');
          }
        });

      return () => {
        cancelled = true;
      };
    }, [db, region, side]),
  );

  if (region == null || side == null) {
    return (
      <>
        <Stack.Screen options={{ title: 'Close-up' }} />
        <ThemedView style={styles.screen}>
          <ThemedText>
            Cannot open close-up: region or side is missing or unknown
            {regionValue == null ? '' : ` (region=${regionValue})`}
            {sideValue == null ? '' : ` (side=${sideValue})`}.
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  const openLandmarkIds = new Set((injuries ?? []).map((injury) => injury.landmarkId));

  async function onLandmarkPress(landmarkId: string) {
    try {
      const open = await listOpenInjuriesForLandmark(db, landmarkId);
      if (open.length === 0) {
        router.push({
          pathname: '/injuries/new',
          params: { landmarkId },
        });
        return;
      }
      router.push({
        pathname: '/landmarks/[id]',
        params: { id: landmarkId },
      });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot open landmark');
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: `${regionLabel(region)} · ${side}` }} />
      <ThemedView style={styles.screen}>
        <ThemedView style={styles.segments}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: side === 'front' }}
            onPress={() => router.setParams({ side: 'front' })}
            style={({ pressed }) => [
              styles.segment,
              side === 'front' && { backgroundColor: theme.backgroundSelected },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">Front</ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: side === 'back' }}
            onPress={() => router.setParams({ side: 'back' })}
            style={({ pressed }) => [
              styles.segment,
              side === 'back' && { backgroundColor: theme.backgroundSelected },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">Back</ThemedText>
          </Pressable>
        </ThemedView>
        {error != null ? (
          <ThemedText>{error}</ThemedText>
        ) : (
          <ThemedView style={styles.mapFrame}>
            <BodyCloseUpMap
              region={region}
              side={side}
              openLandmarkIds={openLandmarkIds}
              onLandmarkPress={onLandmarkPress}
            />
          </ThemedView>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  segments: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  mapFrame: {
    flex: 1,
    minHeight: 280,
  },
  pressed: {
    opacity: 0.7,
  },
});
