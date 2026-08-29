import { Link, Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SymbolView } from 'expo-symbols';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { listOpenInjuries } from '@/db/injuries';
import type { Injury } from '@/domain/injury';
import {
  formatLandmarkLabel,
  getLandmarkById,
  landmarksForArea,
  overviewZoneLabel,
  parseLimb,
  REGION_ORDER,
  type Landmark,
  type OverviewZoneId,
  type Region,
  type Side,
} from '@/domain/landmarks';
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

function areaTitle(region: Region, side: Side, limb: ReturnType<typeof parseLimb>): string {
  if (limb != null && (region === 'arms' || region === 'legs')) {
    const zone: OverviewZoneId = region === 'arms' ? `${limb}-arm` : `${limb}-leg`;
    return `${overviewZoneLabel(zone)} · ${side}`;
  }
  return `${region.charAt(0).toUpperCase() + region.slice(1)} · ${side}`;
}

export default function MapRegionScreen() {
  const { region: regionParam, side: sideParam, limb: limbParam } = useLocalSearchParams<{
    region?: string | string[];
    side?: string | string[];
    limb?: string | string[];
  }>();
  const regionValue = Array.isArray(regionParam) ? regionParam[0] : regionParam;
  const sideValue = Array.isArray(sideParam) ? sideParam[0] : sideParam;
  const limbValue = Array.isArray(limbParam) ? limbParam[0] : limbParam;
  const region = parseRegion(regionValue);
  const side = parseSide(sideValue);
  const limb = parseLimb(limbValue);

  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [injuries, setInjuries] = useState<Injury[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigating = useRef(false);

  useFocusEffect(
    useCallback(() => {
      navigating.current = false;
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
        <Stack.Screen options={{ title: 'Area' }} />
        <ThemedView style={styles.screen}>
          <ThemedText style={styles.message}>
            Cannot open area: region or side is missing or unknown
            {regionValue == null ? '' : ` (region=${regionValue})`}
            {sideValue == null ? '' : ` (side=${sideValue})`}.
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  const landmarks = landmarksForArea(region, side);
  const sections = groupInjuriesByLandmark(landmarks, injuries ?? [], limb);

  function onLog(landmarkId: string) {
    if (navigating.current) {
      return;
    }
    navigating.current = true;
    router.push({
      pathname: '/injuries/new',
      params: { landmarkId, ...(limb == null ? {} : { limb }) },
    });
  }

  return (
    <>
      <Stack.Screen options={{ title: areaTitle(region, side, limb) }} />
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
          <ThemedText style={styles.message}>{error}</ThemedText>
        ) : injuries == null ? null : (
          <ScrollView contentContainerStyle={styles.list}>
            {sections.map((section) => (
              <ThemedView key={section.landmark.id} style={styles.section}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Log injury on ${section.landmark.name}`}
                  onPress={() => onLog(section.landmark.id)}
                  style={({ pressed }) => [
                    styles.sectionHeader,
                    { backgroundColor: theme.backgroundElement },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    {section.landmark.name}
                  </ThemedText>
                  <SymbolView
                    name={{ ios: 'plus', android: 'add' }}
                    size={22}
                    tintColor={theme.text}
                    fallback={
                      <ThemedText type="smallBold" accessibilityElementsHidden>
                        +
                      </ThemedText>
                    }
                  />
                </Pressable>
                {section.items.map((injury) => {
                  const landmark = getLandmarkById(injury.landmarkId);
                  const title =
                    landmark == null
                      ? injury.landmarkId
                      : formatLandmarkLabel(landmark, injury.limb);

                  return (
                    <ThemedView key={injury.id} style={styles.row}>
                      <Link href={`/injuries/${injury.id}`} asChild>
                        <Pressable
                          accessibilityRole="button"
                          style={({ pressed }) => [
                            styles.rowInner,
                            { borderColor: theme.backgroundSelected },
                            pressed && styles.pressed,
                          ]}>
                          <ThemedText type="smallBold">{title}</ThemedText>
                          <ThemedText themeColor="textSecondary" numberOfLines={2}>
                            {injury.description}
                          </ThemedText>
                        </Pressable>
                      </Link>
                    </ThemedView>
                  );
                })}
              </ThemedView>
            ))}
          </ScrollView>
        )}
      </ThemedView>
    </>
  );
}

function groupInjuriesByLandmark(
  landmarks: Landmark[],
  injuries: Injury[],
  limb: ReturnType<typeof parseLimb>,
): { landmark: Landmark; items: Injury[] }[] {
  return landmarks.map((landmark) => ({
    landmark,
    items: injuries.filter((injury) => {
      if (injury.landmarkId !== landmark.id) {
        return false;
      }
      return limb == null || injury.limb === limb;
    }),
  }));
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  segments: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginHorizontal: Spacing.three,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  message: {
    marginHorizontal: Spacing.three,
  },
  row: {
    marginHorizontal: Spacing.three,
  },
  rowInner: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
