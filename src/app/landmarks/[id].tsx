import { Link, Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { listOpenInjuriesForLandmark } from '@/db/injuries';
import type { Injury } from '@/domain/injury';
import { formatLandmarkLabel, getLandmarkById, parseLimb } from '@/domain/landmarks';

export default function LandmarkInjuriesScreen() {
  const { id: idParam, limb: limbParam } = useLocalSearchParams<{
    id?: string | string[];
    limb?: string | string[];
  }>();
  const landmarkId = Array.isArray(idParam) ? idParam[0] : idParam;
  const landmark = landmarkId == null ? undefined : getLandmarkById(landmarkId);
  const limb = parseLimb(Array.isArray(limbParam) ? limbParam[0] : limbParam);

  const db = useSQLiteContext();
  const router = useRouter();
  const [injuries, setInjuries] = useState<Injury[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (landmarkId == null || landmark == null) {
        return;
      }

      let cancelled = false;
      listOpenInjuriesForLandmark(db, landmarkId, limb)
        .then((rows) => {
          if (!cancelled) {
            setError(null);
            setInjuries(rows);
          }
        })
        .catch((caught: unknown) => {
          if (!cancelled) {
            setError(caught instanceof Error ? caught.message : 'Cannot load injuries');
          }
        });

      return () => {
        cancelled = true;
      };
    }, [db, landmark, landmarkId, limb]),
  );

  if (landmarkId == null || landmark == null) {
    return (
      <>
        <Stack.Screen options={{ title: 'Landmark' }} />
        <ThemedView style={styles.screen}>
          <ThemedText>
            Cannot open landmark: id is missing or unknown
            {landmarkId == null ? '' : ` (${landmarkId})`}.
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  const title = formatLandmarkLabel(landmark, limb);

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerRight: () => (
            <Pressable
              accessibilityRole="button"
              hitSlop={Spacing.two}
              onPress={() =>
                router.push({
                  pathname: '/injuries/new',
                  params: { landmarkId, ...(limb == null ? {} : { limb }) },
                })
              }
              style={({ pressed }) => pressed && styles.pressed}>
              <ThemedText type="linkPrimary">Log another</ThemedText>
            </Pressable>
          ),
        }}
      />
      <ThemedView style={styles.screen}>
        {error != null ? (
          <ThemedText>{error}</ThemedText>
        ) : injuries == null ? null : (
          <ScrollView contentContainerStyle={styles.list}>
            {injuries.map((injury) => (
              <Link key={injury.id} href={`/injuries/${injury.id}`} asChild>
                <Pressable
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                  <ThemedView type="backgroundElement" style={styles.rowInner}>
                    <ThemedText themeColor="textSecondary" numberOfLines={3}>
                      {injury.description}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.three,
  },
  list: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  row: {
    borderRadius: Spacing.three,
  },
  rowInner: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
