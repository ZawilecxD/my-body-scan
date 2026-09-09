import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { SymbolView } from 'expo-symbols';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card, Chip, SegmentedControl } from '@/components/ui';
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
    return `${overviewZoneLabel(zone)} · ${side === 'front' ? 'Front' : 'Back'}`;
  }
  return `${region.charAt(0).toUpperCase() + region.slice(1)} · ${side === 'front' ? 'Front' : 'Back'}`;
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
  const openInArea = sections.flatMap((section) => section.items);

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
        <View style={styles.pad}>
          <SegmentedControl
            options={[
              { value: 'front', label: 'Front' },
              { value: 'back', label: 'Back' },
            ]}
            value={side}
            onChange={(next) => router.setParams({ side: next })}
          />
        </View>

        <Card style={styles.locator}>
          <ThemedText type="labelMd" themeColor="textSecondary">
            Locator
          </ThemedText>
          <ThemedText type="titleMd">{areaTitle(region, side, limb)}</ThemedText>
          <ThemedText type="bodySm" themeColor="textSecondary">
            Pick a landmark to log, or open an active flare below.
          </ThemedText>
        </Card>

        {openInArea.length > 0 ? (
          <View style={styles.flareBlock}>
            <ThemedText type="titleMd" style={styles.pad}>
              Active flares
            </ThemedText>
            {openInArea.map((injury) => {
              const landmark = getLandmarkById(injury.landmarkId);
              const title =
                landmark == null
                  ? injury.landmarkId
                  : formatLandmarkLabel(landmark, injury.limb);
              return (
                <Pressable
                  key={injury.id}
                  accessibilityRole="button"
                  onPress={() => {
                    if (navigating.current) {
                      return;
                    }
                    navigating.current = true;
                    router.push(`/injuries/${injury.id}`);
                  }}
                  style={({ pressed }) => [styles.padH, pressed && styles.pressed]}>
                  <Card style={styles.flareCard}>
                    <Chip label="OPEN" selected />
                    <ThemedText type="titleMd">{title}</ThemedText>
                    <ThemedText type="bodySm" themeColor="textSecondary" numberOfLines={2}>
                      {injury.description}
                    </ThemedText>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {error != null ? (
          <ThemedText style={styles.message}>{error}</ThemedText>
        ) : injuries == null ? null : (
          <ScrollView contentContainerStyle={styles.list}>
            {sections.map((section) => (
              <Card key={section.landmark.id} style={styles.landmarkCard}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Log injury on ${section.landmark.name}`}
                  onPress={() => onLog(section.landmark.id)}
                  style={({ pressed }) => [styles.sectionHeader, pressed && styles.pressed]}>
                  <View style={styles.sectionTitleBlock}>
                    <ThemedText type="titleMd">{section.landmark.name}</ThemedText>
                    <ThemedText type="bodySm" themeColor="textSecondary">
                      {section.items.length === 0
                        ? 'No open injuries'
                        : `${section.items.length} open`}
                    </ThemedText>
                  </View>
                  <View style={[styles.logPill, { backgroundColor: theme.primaryContainer }]}>
                    <SymbolView
                      name={{ ios: 'plus', android: 'add', web: 'add' }}
                      size={18}
                      tintColor={theme.onPrimary}
                      fallback={
                        <ThemedText type="labelMd" style={{ color: theme.onPrimary }}>
                          +
                        </ThemedText>
                      }
                    />
                    <ThemedText type="labelMd" style={{ color: theme.onPrimary }}>
                      Log
                    </ThemedText>
                  </View>
                </Pressable>
                {section.items.map((injury) => {
                  const landmark = getLandmarkById(injury.landmarkId);
                  const title =
                    landmark == null
                      ? injury.landmarkId
                      : formatLandmarkLabel(landmark, injury.limb);

                  return (
                    <Pressable
                      key={injury.id}
                      accessibilityRole="button"
                      onPress={() => {
                        if (navigating.current) {
                          return;
                        }
                        navigating.current = true;
                        router.push(`/injuries/${injury.id}`);
                      }}
                      style={({ pressed }) => [styles.injuryRow, pressed && styles.pressed]}>
                      <ThemedText type="smallBold">{title}</ThemedText>
                      <ThemedText themeColor="textSecondary" numberOfLines={2}>
                        {injury.description}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </Card>
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
    paddingTop: Spacing.spaceMd,
    gap: Spacing.spaceSm,
  },
  pad: {
    marginHorizontal: Spacing.spaceMd,
  },
  padH: {
    marginHorizontal: Spacing.spaceMd,
  },
  locator: {
    marginHorizontal: Spacing.spaceMd,
    gap: Spacing.space2xs,
  },
  flareBlock: {
    gap: Spacing.spaceXs,
  },
  flareCard: {
    gap: Spacing.spaceXs,
  },
  list: {
    gap: Spacing.spaceSm,
    paddingHorizontal: Spacing.spaceMd,
    paddingBottom: Spacing.spaceXl,
  },
  landmarkCard: {
    gap: Spacing.spaceXs,
    padding: Spacing.spaceSm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.spaceSm,
  },
  sectionTitleBlock: {
    flex: 1,
    gap: 2,
  },
  logPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.spaceSm,
    paddingVertical: Spacing.space2xs,
    borderRadius: 999,
  },
  injuryRow: {
    gap: Spacing.one,
    paddingVertical: Spacing.spaceXs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  message: {
    marginHorizontal: Spacing.spaceMd,
  },
  pressed: {
    opacity: 0.7,
  },
});
