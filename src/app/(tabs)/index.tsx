import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SymbolView } from 'expo-symbols';
import { useCallback, useRef, useState, type MutableRefObject } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BodyOverviewMap } from '@/components/body-overview-map';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton, Card, IconButton } from '@/components/ui';
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

  const openInjury = (id: number) => {
    if (navigating.current) {
      return;
    }
    navigating.current = true;
    router.push(`/injuries/${id}`);
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
        {view === 'graphic' ? (
          <>
            {error != null ? (
              <ThemedText>{error}</ThemedText>
            ) : (
              <Card style={styles.mapCard} elevated>
                <View
                  style={[
                    styles.sideToggle,
                    {
                      backgroundColor: theme.surfaceContainerLow,
                      borderColor: theme.outlineVariant,
                    },
                  ]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: side === 'front' }}
                    hitSlop={Spacing.one}
                    onPress={() => setSide('front')}
                    style={({ pressed }) => [
                      styles.sideOption,
                      side === 'front' && { backgroundColor: theme.secondaryContainer },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText
                      type="labelMd"
                      themeColor={side === 'front' ? 'onSurface' : 'textSecondary'}>
                      Front
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: side === 'back' }}
                    hitSlop={Spacing.one}
                    onPress={() => setSide('back')}
                    style={({ pressed }) => [
                      styles.sideOption,
                      side === 'back' && { backgroundColor: theme.secondaryContainer },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText
                      type="labelMd"
                      themeColor={side === 'back' ? 'onSurface' : 'textSecondary'}>
                      Back
                    </ThemedText>
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="button"
                  hitSlop={Spacing.one}
                  onPress={() => setView('list')}
                  style={({ pressed }) => [styles.listLink, pressed && styles.pressed]}>
                  <ThemedText type="linkPrimary">List</ThemedText>
                </Pressable>
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
              </Card>
            )}
            <AppButton label="Log injury" onPress={openLogInjury} style={styles.logButton} />
          </>
        ) : (
          <>
            <View style={styles.listToolbar}>
              <Pressable
                accessibilityRole="button"
                hitSlop={Spacing.one}
                onPress={() => setView('graphic')}
                style={({ pressed }) => pressed && styles.pressed}>
                <ThemedText type="linkPrimary">Graphic</ThemedText>
              </Pressable>
            </View>
            {error != null ? (
              <ThemedText>{error}</ThemedText>
            ) : injuries == null ? null : injuries.length === 0 ? (
              <ThemedView style={styles.empty}>
                <ThemedText>No open injuries yet.</ThemedText>
                <AppButton label="Log injury" onPress={openLogInjury} style={styles.logButton} />
              </ThemedView>
            ) : (
              <ScrollView contentContainerStyle={styles.list}>
                {linkError != null ? <ThemedText>{linkError}</ThemedText> : null}
                {groups.map((group) => (
                  <View key={group.region} style={styles.section}>
                    <ThemedText type="labelMd" themeColor="textSecondary">
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
                        <Card key={injury.id} style={styles.rowCard}>
                          <Pressable
                            accessibilityRole="button"
                            onPress={() => openInjury(injury.id)}
                            style={({ pressed }) => pressed && styles.pressed}>
                            <ThemedText type="titleMd">{title}</ThemedText>
                            <ThemedText type="bodyMd" themeColor="textSecondary" numberOfLines={2}>
                              {injury.description}
                            </ThemedText>
                          </Pressable>
                          {latest != null ? (
                            <>
                              <ThemedText type="bodySm" numberOfLines={1}>
                                {latest.body}
                              </ThemedText>
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
                        </Card>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}
      </ThemedView>
    </>
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
    padding: Spacing.spaceMd,
    gap: Spacing.spaceSm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  mapCard: {
    flex: 1,
    minHeight: 320,
    padding: Spacing.spaceXs,
    overflow: 'hidden',
  },
  sideToggle: {
    position: 'absolute',
    top: Spacing.spaceXs,
    right: Spacing.spaceXs,
    zIndex: 2,
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 2,
    gap: 2,
  },
  sideOption: {
    paddingHorizontal: Spacing.spaceXs,
    paddingVertical: 4,
    borderRadius: 6,
  },
  listLink: {
    position: 'absolute',
    right: Spacing.spaceSm,
    bottom: Spacing.spaceSm,
    zIndex: 2,
    paddingHorizontal: Spacing.spaceXs,
    paddingVertical: 4,
  },
  listToolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  list: {
    gap: Spacing.spaceMd,
    paddingBottom: Spacing.spaceXl,
  },
  section: {
    gap: Spacing.spaceXs,
  },
  rowCard: {
    gap: Spacing.spaceXs,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: Spacing.spaceMd,
    paddingHorizontal: Spacing.spaceMd,
  },
  logButton: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.7,
  },
});
