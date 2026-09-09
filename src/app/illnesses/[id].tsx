import { Stack, useLocalSearchParams } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton, Card, Chip, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { createEpisode, listEpisodesForIllness } from '@/db/episodes';
import { getIllnessById } from '@/db/illnesses';
import { createSymptomTactic, listSymptomTacticsForIllness } from '@/db/tactics';
import { isHttpUrl } from '@/domain/http-url';
import type { Illness, IllnessEpisode, SymptomTactic } from '@/domain/illness';

export default function IllnessDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const idValue = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idValue == null ? Number.NaN : Number(idValue);

  const db = useSQLiteContext();
  const [illness, setIllness] = useState<Illness | null | undefined>(undefined);
  const [episodes, setEpisodes] = useState<IllnessEpisode[]>([]);
  const [tactics, setTactics] = useState<SymptomTactic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [tacticBody, setTacticBody] = useState('');
  const [tacticUrl, setTacticUrl] = useState('');
  const addingEpisode = useRef(false);
  const addingTactic = useRef(false);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setIllness(null);
      setError(`Cannot open illness: invalid id "${idValue ?? ''}"`);
      return;
    }

    let cancelled = false;
    loadIllness(db, id)
      .then((loaded) => {
        if (cancelled) {
          return;
        }
        if (loaded.illness == null) {
          setIllness(null);
          setError(`Cannot open illness: not found (${id})`);
          return;
        }
        setError(null);
        setIllness(loaded.illness);
        setEpisodes(loaded.episodes);
        setTactics(loaded.tactics);
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setIllness(null);
          setError(caught instanceof Error ? caught.message : `Cannot open illness ${id}`);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [db, id, idValue]);

  const trimmedTactic = tacticBody.trim();

  async function onLogEpisode() {
    if (addingEpisode.current || Number.isNaN(id)) {
      return;
    }
    addingEpisode.current = true;
    try {
      await createEpisode(db, { illnessId: id });
      const nextEpisodes = await listEpisodesForIllness(db, id);
      setEpisodes(nextEpisodes);
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot log episode');
    } finally {
      addingEpisode.current = false;
    }
  }

  async function onAddTactic() {
    if (addingTactic.current || trimmedTactic.length === 0 || Number.isNaN(id)) {
      return;
    }
    addingTactic.current = true;
    try {
      await createSymptomTactic(db, {
        illnessId: id,
        body: tacticBody,
        url: tacticUrl,
      });
      const nextTactics = await listSymptomTacticsForIllness(db, id);
      setTactics(nextTactics);
      setTacticBody('');
      setTacticUrl('');
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot add symptom tactic');
    } finally {
      addingTactic.current = false;
    }
  }

  async function onOpenUrl(url: string) {
    if (!isHttpUrl(url)) {
      return;
    }
    try {
      await Linking.openURL(url);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : `Cannot open URL (${url})`);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: illness?.name ?? 'Illness' }} />
      <ThemedView style={styles.screen}>
        {illness === undefined ? null : error != null && illness == null ? (
          <ThemedText>{error}</ThemedText>
        ) : illness == null ? (
          <ThemedText>{error ?? 'Cannot open illness.'}</ThemedText>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scroll}>
            <View style={styles.headerRow}>
              <ThemedText type="headlineMd" style={styles.flex}>
                {illness.name}
              </ThemedText>
              <Chip
                label={episodes.length === 1 ? '1 episode' : `${episodes.length} episodes`}
                selected={episodes.length > 0}
              />
            </View>
            <ThemedText type="bodySm" themeColor="textSecondary">
              Logged {new Date(illness.createdAt).toLocaleString()}
            </ThemedText>
            {error != null ? <ThemedText themeColor="error">{error}</ThemedText> : null}

            <Card style={styles.block}>
              <ThemedText type="labelMd" themeColor="textSecondary">
                Notes
              </ThemedText>
              {illness.notes != null && illness.notes.trim().length > 0 ? (
                <ThemedText type="bodyLg">{illness.notes}</ThemedText>
              ) : (
                <ThemedText type="bodySm" themeColor="textSecondary">
                  No notes.
                </ThemedText>
              )}
            </Card>

            <View style={styles.block}>
              <ThemedText type="titleMd">Episodes</ThemedText>
              {episodes.length === 0 ? (
                <ThemedText type="bodySm" themeColor="textSecondary">
                  No episodes yet.
                </ThemedText>
              ) : (
                episodes.map((episode) => (
                  <Card key={episode.id} style={styles.itemCard}>
                    <ThemedText type="bodyMd">
                      {new Date(episode.notedAt).toLocaleString()}
                    </ThemedText>
                  </Card>
                ))
              )}
              <AppButton label="Log episode" onPress={onLogEpisode} />
            </View>

            <View style={styles.block}>
              <ThemedText type="titleMd">Symptom tactics</ThemedText>
              {tactics.length === 0 ? (
                <ThemedText type="bodySm" themeColor="textSecondary">
                  No symptom tactics yet.
                </ThemedText>
              ) : (
                tactics.map((tactic) => (
                  <Card key={tactic.id} style={styles.itemCard}>
                    <ThemedText type="bodyMd">{tactic.body}</ThemedText>
                    {tactic.url != null && isHttpUrl(tactic.url) ? (
                      <TacticLink url={tactic.url} onOpen={onOpenUrl} />
                    ) : null}
                    <ThemedText type="bodySm" themeColor="textSecondary">
                      {new Date(tactic.createdAt).toLocaleString()}
                    </ThemedText>
                  </Card>
                ))
              )}
              <Card style={styles.itemCard}>
                <TextField
                  label="Add symptom tactic"
                  accessibilityLabel="Symptom tactic"
                  multiline
                  textAlignVertical="top"
                  value={tacticBody}
                  onChangeText={setTacticBody}
                  style={styles.inputTall}
                />
                <TextField
                  label="URL (optional)"
                  accessibilityLabel="URL (optional)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  value={tacticUrl}
                  onChangeText={setTacticUrl}
                />
                <AppButton
                  label="Add tactic"
                  disabled={trimmedTactic.length === 0}
                  onPress={onAddTactic}
                />
              </Card>
            </View>
          </ScrollView>
        )}
      </ThemedView>
    </>
  );
}

function TacticLink({ url, onOpen }: { url: string; onOpen: (url: string) => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => onOpen(url)}
      style={({ pressed }) => pressed && styles.pressed}>
      <ThemedText type="linkPrimary">Open link</ThemedText>
    </Pressable>
  );
}

async function loadIllness(
  db: SQLiteDatabase,
  illnessId: number,
): Promise<{
  illness: Illness | null;
  episodes: IllnessEpisode[];
  tactics: SymptomTactic[];
}> {
  const illness = await getIllnessById(db, illnessId);
  if (illness == null) {
    return { illness: null, episodes: [], tactics: [] };
  }
  const [episodes, tactics] = await Promise.all([
    listEpisodesForIllness(db, illnessId),
    listSymptomTacticsForIllness(db, illnessId),
  ]);
  return { illness, episodes, tactics };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.spaceMd,
    gap: Spacing.spaceSm,
    paddingBottom: Spacing.spaceXl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.spaceSm,
  },
  flex: {
    flex: 1,
  },
  block: {
    gap: Spacing.spaceXs,
  },
  itemCard: {
    gap: Spacing.spaceXs,
  },
  inputTall: {
    minHeight: 80,
  },
  pressed: {
    opacity: 0.7,
  },
});
