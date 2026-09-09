import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card, Chip } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { listArchivedInjuries } from '@/db/injuries';
import type { Injury } from '@/domain/injury';
import { formatLandmarkLabel, getLandmarkById } from '@/domain/landmarks';

export default function ArchiveScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [injuries, setInjuries] = useState<Injury[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigating = useRef(false);

  useFocusEffect(
    useCallback(() => {
      navigating.current = false;
      let cancelled = false;

      listArchivedInjuries(db)
        .then((rows) => {
          if (!cancelled) {
            setError(null);
            setInjuries(rows);
          }
        })
        .catch((caught: unknown) => {
          if (!cancelled) {
            setError(caught instanceof Error ? caught.message : 'Cannot load archived injuries');
          }
        });

      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  return (
    <>
      <Tabs.Screen options={{ title: 'Archive' }} />
      <ThemedView style={styles.screen}>
        {error != null ? (
          <ThemedText>{error}</ThemedText>
        ) : injuries == null ? null : injuries.length === 0 ? (
          <ThemedView style={styles.empty}>
            <ThemedText type="bodyLg">No archived injuries.</ThemedText>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Archive an open injury from its detail screen to see it here.
            </ThemedText>
          </ThemedView>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {injuries.map((injury) => {
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
                  style={({ pressed }) => pressed && styles.pressed}>
                  <Card style={styles.rowCard}>
                    <Chip label="Archived" />
                    <ThemedText type="titleMd">{title}</ThemedText>
                    <ThemedText type="bodyMd" themeColor="textSecondary" numberOfLines={2}>
                      {injury.description}
                    </ThemedText>
                    {injury.archivedAt != null ? (
                      <ThemedText type="bodySm" themeColor="textSecondary">
                        Archived {new Date(injury.archivedAt).toLocaleString()}
                      </ThemedText>
                    ) : null}
                  </Card>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.spaceXl,
    gap: Spacing.spaceXs,
  },
  list: {
    padding: Spacing.spaceMd,
    gap: Spacing.spaceSm,
    paddingBottom: Spacing.spaceXl,
  },
  rowCard: {
    gap: Spacing.space2xs,
  },
  pressed: {
    opacity: 0.7,
  },
});
