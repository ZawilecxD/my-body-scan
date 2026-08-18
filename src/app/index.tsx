import { Link, Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { listOpenInjuries } from '@/db/injuries';
import type { Injury } from '@/domain/injury';
import { getLandmarkById, REGION_ORDER, type Region } from '@/domain/landmarks';

export default function OpenInjuriesScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
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
        {error != null ? (
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
