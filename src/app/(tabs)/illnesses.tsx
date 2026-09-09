import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  countEpisodesByIllnessIds,
  latestEpisodeNotedAtByIllnessIds,
} from '@/db/episodes';
import { listIllnesses } from '@/db/illnesses';
import type { Illness } from '@/domain/illness';

export default function IllnessesScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [illnesses, setIllnesses] = useState<Illness[] | null>(null);
  const [episodeCounts, setEpisodeCounts] = useState<Record<number, number>>({});
  const [latestNotedAt, setLatestNotedAt] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const navigating = useRef(false);

  useFocusEffect(
    useCallback(() => {
      navigating.current = false;
      let cancelled = false;

      listIllnesses(db)
        .then(async (rows) => {
          const ids = rows.map((row) => row.id);
          const [counts, latest] = await Promise.all([
            countEpisodesByIllnessIds(db, ids),
            latestEpisodeNotedAtByIllnessIds(db, ids),
          ]);
          if (!cancelled) {
            setError(null);
            setIllnesses(rows);
            setEpisodeCounts(counts);
            setLatestNotedAt(latest);
          }
        })
        .catch((caught: unknown) => {
          if (!cancelled) {
            setError(caught instanceof Error ? caught.message : 'Cannot load illnesses');
          }
        });

      return () => {
        cancelled = true;
      };
    }, [db]),
  );

  return (
    <>
      <Tabs.Screen
        options={{
          title: 'Illnesses',
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              hitSlop={Spacing.two}
              onPress={() => {
                if (navigating.current) {
                  return;
                }
                navigating.current = true;
                router.push('/illnesses/new');
              }}
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText type="linkPrimary">Log illness</ThemedText>
            </Pressable>
          ),
        }}
      />
      <ThemedView style={styles.screen}>
        {error != null ? (
          <ThemedText>{error}</ThemedText>
        ) : illnesses == null ? null : illnesses.length === 0 ? (
          <ThemedView style={styles.empty}>
            <ThemedText>No illnesses logged yet.</ThemedText>
          </ThemedView>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {illnesses.map((illness) => {
              const count = episodeCounts[illness.id] ?? 0;
              const latest = latestNotedAt[illness.id];
              return (
                <Pressable
                  key={illness.id}
                  accessibilityRole="button"
                  onPress={() => {
                    if (navigating.current) {
                      return;
                    }
                    navigating.current = true;
                    router.push(`/illnesses/${illness.id}`);
                  }}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <ThemedView type="backgroundElement" style={styles.rowInner}>
                    <ThemedText type="smallBold">{illness.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {count === 1 ? '1 episode' : `${count} episodes`}
                      {latest != null
                        ? ` · latest ${new Date(latest).toLocaleString()}`
                        : ''}
                    </ThemedText>
                  </ThemedView>
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
    padding: Spacing.four,
    gap: Spacing.two,
  },
  list: {
    padding: Spacing.three,
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
  pressed: {
    opacity: 0.7,
  },
});
