import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SymbolView } from 'expo-symbols';
import { useCallback, useRef, useState, type MutableRefObject } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BodyOverviewMap } from '@/components/body-overview-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconButton } from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
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

function InjuriesHeaderActions({ navigating }: { navigating: MutableRefObject<boolean> }) {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={styles.headerActions}>
      <IconButton
        accessibilityLabel="Summary"
        onPress={() => {
          if (navigating.current) {
            return;
          }
          navigating.current = true;
          router.push('/summary');
        }}>
        <SymbolView
          name={{ ios: 'doc.text', android: 'description', web: 'description' }}
          size={22}
          tintColor={theme.primary}
          fallback={<ThemedText type="linkPrimary">Σ</ThemedText>}
        />
      </IconButton>
      <IconButton
        accessibilityLabel="Backup"
        onPress={() => {
          if (navigating.current) {
            return;
          }
          navigating.current = true;
          router.push('/backup');
        }}>
        <SymbolView
          name={{ ios: 'externaldrive', android: 'backup', web: 'backup' }}
          size={22}
          tintColor={theme.primary}
          fallback={<ThemedText type="linkPrimary">⇪</ThemedText>}
        />
      </IconButton>
    </View>
  );
}

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

  const openLogInjury = () => {
    if (navigating.current) {
      return;
    }
    navigating.current = true;
    router.push('/landmarks');
  };

  return (
    <>
      <Tabs.Screen
        options={{
          title: 'Injuries',
          headerRight: () => <InjuriesHeaderActions navigating={navigating} />,
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
              onPress={openLogInjury}
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log injury"
          onPress={openLogInjury}
          style={({ pressed }) => [
            styles.fab,
            {
              backgroundColor: theme.primaryContainer,
              bottom: Spacing.spaceMd,
            },
            pressed && styles.fabPressed,
          ]}>
          <SymbolView
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            size={20}
            tintColor={theme.onPrimary}
            fallback={
              <ThemedText type="labelMd" style={{ color: theme.onPrimary }}>
                +
              </ThemedText>
            }
          />
          <ThemedText type="labelMd" style={{ color: theme.onPrimary }}>
            Log injury
          </ThemedText>
        </Pressable>
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
    paddingBottom: Spacing.six,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
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
  fab: {
    position: 'absolute',
    right: Spacing.spaceMd,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.spaceXs,
    paddingHorizontal: Spacing.spaceLg,
    paddingVertical: Spacing.spaceSm,
    borderRadius: Radii.full,
  },
  fabPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  pressed: {
    opacity: 0.7,
  },
});
