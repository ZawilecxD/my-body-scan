import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet } from 'react-native';

import { BodyOverviewMap } from '@/components/body-overview-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { listOpenInjuries } from '@/db/injuries';
import { listLatestSolutionsByInjuryIds } from '@/db/solutions';
import { isHttpUrl } from '@/domain/http-url';
import type { Injury, Solution } from '@/domain/injury';
import {
  formatLandmarkLabel,
  getLandmarkById,
  injuryMatchesOverviewZone,
  OVERVIEW_ZONE_IDS,
  overviewZoneLimb,
  overviewZoneRegion,
  REGION_ORDER,
  type OverviewZoneId,
  type Region,
  type Side,
} from '@/domain/landmarks';
import { useTheme } from '@/hooks/use-theme';

type HomeView = 'graphic' | 'list';

export default function OpenInjuriesScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [view, setView] = useState<HomeView>('graphic');
  const [side, setSide] = useState<Side>('front');
  const [injuries, setInjuries] = useState<Injury[] | null>(null);
  const [latestSolutions, setLatestSolutions] = useState<Record<number, Solution>>({});
  const [error, setError] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const navigating = useRef(false);

  useFocusEffect(
    useCallback(() => {
      navigating.current = false;
      let cancelled = false;

      listOpenInjuries(db)
        .then(async (rows) => {
          const latest = await listLatestSolutionsByInjuryIds(
            db,
            rows.map((row) => row.id),
          );
          if (!cancelled) {
            setError(null);
            setLinkError(null);
            setInjuries(rows);
            setLatestSolutions(latest);
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

  const groups = injuries == null ? [] : groupInjuriesByRegion(injuries);
  const openCounts = countOpenByZone(injuries ?? [], side);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Open injuries',
          headerRight: () => (
            <ThemedView style={styles.headerActions}>
              <Pressable
                accessibilityRole="button"
                hitSlop={Spacing.two}
                onPress={() => {
                  if (navigating.current) {
                    return;
                  }
                  navigating.current = true;
                  router.push('/archive');
                }}
                style={({ pressed }) => pressed && styles.pressed}>
                <ThemedText type="linkPrimary">Archive</ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                hitSlop={Spacing.two}
                onPress={() => {
                  if (navigating.current) {
                    return;
                  }
                  navigating.current = true;
                  router.push('/landmarks');
                }}
                style={({ pressed }) => pressed && styles.pressed}>
                <ThemedText type="linkPrimary">Log injury</ThemedText>
              </Pressable>
            </ThemedView>
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
                  openCounts={openCounts}
                  onZonePress={(zone) => {
                    if (navigating.current) {
                      return;
                    }
                    navigating.current = true;
                    const limb = overviewZoneLimb(zone);
                    router.push({
                      pathname: '/map/[region]',
                      params: {
                        region: overviewZoneRegion(zone),
                        side,
                        ...(limb == null ? {} : { limb }),
                      },
                    });
                  }}
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
            {linkError != null ? <ThemedText>{linkError}</ThemedText> : null}
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
                      : formatLandmarkLabel(landmark, injury.limb);
                  const latest = latestSolutions[injury.id];

                  return (
                    <ThemedView
                      key={injury.id}
                      type="backgroundElement"
                      style={styles.rowInner}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => {
                          if (navigating.current) {
                            return;
                          }
                          navigating.current = true;
                          router.push(`/injuries/${injury.id}`);
                        }}
                        style={({ pressed }) => pressed && styles.pressed}>
                        <ThemedText type="smallBold">{title}</ThemedText>
                        <ThemedText themeColor="textSecondary" numberOfLines={2}>
                          {injury.description}
                        </ThemedText>
                      </Pressable>
                      {latest != null ? (
                        <>
                          <ThemedText numberOfLines={1}>{latest.body}</ThemedText>
                          {latest.url != null && isHttpUrl(latest.url) ? (
                            <Pressable
                              accessibilityRole="link"
                              onPress={() => {
                                const url = latest.url;
                                if (url == null || !isHttpUrl(url)) {
                                  return;
                                }
                                Linking.openURL(url).catch((caught: unknown) => {
                                  setLinkError(
                                    caught instanceof Error
                                      ? caught.message
                                      : `Cannot open URL (${url})`,
                                  );
                                });
                              }}
                              style={({ pressed }) => pressed && styles.pressed}>
                              <ThemedText type="linkPrimary">Open link</ThemedText>
                            </Pressable>
                          ) : null}
                        </>
                      ) : null}
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

function countOpenByZone(
  injuries: Injury[],
  side: Side,
): Partial<Record<OverviewZoneId, number>> {
  const counts: Partial<Record<OverviewZoneId, number>> = {};
  for (const zone of OVERVIEW_ZONE_IDS) {
    const count = injuries.filter((injury) =>
      injuryMatchesOverviewZone(getLandmarkById(injury.landmarkId), injury.limb, side, zone),
    ).length;
    if (count > 0) {
      counts[zone] = count;
    }
  }
  return counts;
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
    overflow: 'hidden',
  },
  list: {
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  section: {
    gap: Spacing.two,
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
