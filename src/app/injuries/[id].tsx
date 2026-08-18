import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getInjuryById } from '@/db/injuries';
import type { Injury } from '@/domain/injury';
import { getLandmarkById } from '@/domain/landmarks';

export default function InjuryDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const idValue = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idValue == null ? Number.NaN : Number(idValue);

  const db = useSQLiteContext();
  const [injury, setInjury] = useState<Injury | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setInjury(null);
      setError(`Cannot open injury: invalid id "${idValue ?? ''}"`);
      return;
    }

    let cancelled = false;
    getInjuryById(db, id)
      .then((row) => {
        if (cancelled) {
          return;
        }
        if (row == null) {
          setInjury(null);
          setError(`Cannot open injury: not found (${id})`);
          return;
        }
        setError(null);
        setInjury(row);
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setInjury(null);
          setError(caught instanceof Error ? caught.message : `Cannot open injury ${id}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [db, id, idValue]);

  const landmark = injury == null ? undefined : getLandmarkById(injury.landmarkId);

  return (
    <>
      <Stack.Screen options={{ title: landmark?.name ?? 'Injury' }} />
      <ThemedView style={styles.screen}>
        {injury === undefined ? null : error != null || injury == null ? (
          <ThemedText>{error ?? 'Cannot open injury.'}</ThemedText>
        ) : (
          <>
            <ThemedText type="smallBold">
              {landmark == null ? injury.landmarkId : `${landmark.name} · ${landmark.side}`}
            </ThemedText>
            <ThemedText>{injury.description}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {new Date(injury.createdAt).toLocaleString()}
            </ThemedText>
          </>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
});
