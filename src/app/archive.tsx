import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { listArchivedInjuries } from '@/db/injuries';
import type { Injury } from '@/domain/injury';
import { formatLandmarkLabel, getLandmarkById } from '@/domain/landmarks';
import { useLocale } from '@/i18n/locale-context';

export default function ArchiveScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { t, resolvedLocale } = useLocale();
  const dateLocale = resolvedLocale === 'pl' ? 'pl-PL' : 'en-US';
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
            setError(caught instanceof Error ? caught.message : t('archive.loadError'));
          }
        });

      return () => {
        cancelled = true;
      };
    }, [db, t]),
  );

  return (
    <>
      <Stack.Screen options={{ title: t('archive.title') }} />
      <ThemedView style={styles.screen}>
        {error != null ? (
          <ThemedText>{error}</ThemedText>
        ) : injuries == null ? null : injuries.length === 0 ? (
          <ThemedView style={styles.empty}>
            <ThemedText>{t('archive.empty')}</ThemedText>
          </ThemedView>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {injuries.map((injury) => {
              const landmark = getLandmarkById(injury.landmarkId);
              const title =
                landmark == null
                  ? injury.landmarkId
                  : formatLandmarkLabel(landmark, t, injury.limb);

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
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <ThemedView type="backgroundElement" style={styles.rowInner}>
                    <ThemedText type="smallBold">{title}</ThemedText>
                    <ThemedText themeColor="textSecondary" numberOfLines={2}>
                      {injury.description}
                    </ThemedText>
                    {injury.archivedAt != null ? (
                      <ThemedText type="small" themeColor="textSecondary">
                        {t('archive.archivedAt', {
                          date: new Date(injury.archivedAt).toLocaleString(dateLocale),
                        })}
                      </ThemedText>
                    ) : null}
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
