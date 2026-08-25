import { Link, Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { BodyOverviewMap } from '@/components/body-overview-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { listOpenInjuries } from '@/db/injuries';
import type { Injury } from '@/domain/injury';
import { getLandmarkById, REGION_ORDER, type Region, type Side } from '@/domain/landmarks';
import { useTheme } from '@/hooks/use-theme';

type HomeView = 'graphic' | 'list';

export default function OpenInjuriesScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [view, setView] = useState<HomeView>('graphic');
  const [side, setSide] = useState<Side>('front');
  const [injuries, setInjuries] = useState<Injury[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
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
    }, [db]),
  );

  const openLandmarkIds = new Set((injuries ?? []).map((injury) => injury.landmarkId));
  const groups = injuries == null ? [] : groupInjuriesByRegion(injuries);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Open injuries',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              hitSlop={Spacing.two}
              onPress={() => router.push('/landmarks')}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText type="linkPrimary">Log injury</ThemedText>
            </Pressable>
          ),
        }}
      />
      <ThemedView style={styles.screen}>
        <ThemedView style={styles.segments}>
          <SegmentButton
            label="Graphic"
            selected={view === 'graphic'}
            onPress={() => setView('graphic')}
            selectedBackground={theme.backgroundSelected}
          />
          <SegmentButton
            label="List"
            selected={view === 'list'}
            onPress={() => setView('list')}
            selectedBackground={theme.backgroundSelected}
          />
        </ThemedView>

        {view === 'graphic' ? (
          <>
            <ThemedView style={styles.segments}>
              <SegmentButton
                label="Front"
                selected={side === 'front'}
                onPress={() => setSide('front')}
                selectedBackground={theme.backgroundSelected}
              />
              <SegmentButton
                label="Back"
                selected={side === 'back'}
                onPress={() => setSide('back')}
                selectedBackground={theme.backgroundSelected}
              />
            </ThemedView>
            {error != null ? (
              <ThemedText>{error}</ThemedText>
            ) : (
              <ThemedView style={styles.mapFrame}>
                <BodyOverviewMap
                  side={side}
                  openLandmarkIds={openLandmarkIds}
                  onRegionPress={(region) =>
                    router.push({
                      pathname: '/map/[region]',
                      params: { region, side },
                    })
                  }
                />
              </ThemedView>
            )}
          </>
        ) : error != null ? (
          <ThemedText>{error}</ThemedText>
        ) : injuries == null ? null : injuries.length === 0 ? (
          <ThemedView style={styles.empty}>
            <ThemedText>No open injuries yet.</ThemedText>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/landmarks')}
              style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
              <ThemedText type="linkPrimary">Log injury</ThemedText>
            </Pressable>
          </ThemedView>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {groups.map((group) => (
              <ThemedView key={group.region} style={styles.section}>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {regionLabel(group.region)}
                </ThemedText>
                {group.items.map((injury) => {
                  const landmark = getLandmarkById(injury.landmarkId);
                  const title =
                    landmark == null
                      ? injury.landmarkId
                      : `${landmark.name} · ${landmark.side}`;

                  return (
                    <Link key={injury.id} href={`/injuries/${injury.id}`} asChild>
                      <Pressable
                        accessibilityRole="button"
                        style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                        <ThemedView type="backgroundElement" style={styles.rowInner}>
                          <ThemedText type="smallBold">{title}</ThemedText>
                          <ThemedText themeColor="textSecondary" numberOfLines={2}>
                            {injury.description}
                          </ThemedText>
                        </ThemedView>
                      </Pressable>
                    </Link>
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

function SegmentButton({
  label,
  selected,
  onPress,
  selectedBackground,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  selectedBackground: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.segment,
        selected && { backgroundColor: selectedBackground },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="smallBold">{label}</ThemedText>
    </Pressable>
  );
}

function groupInjuriesByRegion(injuries: Injury[]): { region: Region; items: Injury[] }[] {
  return REGION_ORDER.flatMap((region) => {
    const items = injuries.filter((injury) => getLandmarkById(injury.landmarkId)?.region === region);
    return items.length > 0 ? [{ region, items }] : [];
  });
}

function regionLabel(region: Region): string {
  return region.charAt(0).toUpperCase() + region.slice(1);
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
    minHeight: 320,
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  section: {
    gap: Spacing.two,
  },
  row: {
    borderRadius: Spacing.three,
  },
  rowInner: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  cta: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
