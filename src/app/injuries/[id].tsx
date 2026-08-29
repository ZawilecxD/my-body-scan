import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createComment, listCommentsForInjury } from '@/db/comments';
import { listEventsForInjury } from '@/db/events';
import { archiveInjury, getInjuryById, reopenInjury } from '@/db/injuries';
import { createSeverityReading, listSeverityReadingsForInjury } from '@/db/readings';
import {
  createSolution,
  getSolutionById,
  listSolutionsForInjury,
  removeSolution,
} from '@/db/solutions';
import { isHttpUrl } from '@/domain/http-url';
import type { Comment, Injury, InjuryEvent, SeverityReading, Solution } from '@/domain/injury';
import { formatLandmarkLabel, getLandmarkById } from '@/domain/landmarks';
import { useTheme } from '@/hooks/use-theme';

export default function InjuryDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id?: string | string[] }>();
  const idValue = Array.isArray(idParam) ? idParam[0] : idParam;
  const id = idValue == null ? Number.NaN : Number(idValue);

  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [injury, setInjury] = useState<Injury | null | undefined>(undefined);
  const [comments, setComments] = useState<Comment[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [readings, setReadings] = useState<SeverityReading[]>([]);
  const [events, setEvents] = useState<InjuryEvent[]>([]);
  const [eventLabels, setEventLabels] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [solutionBody, setSolutionBody] = useState('');
  const [solutionUrl, setSolutionUrl] = useState('');
  const [severityText, setSeverityText] = useState('');
  const addingComment = useRef(false);
  const addingSolution = useRef(false);
  const addingReading = useRef(false);
  const removingSolution = useRef(false);
  const statusAction = useRef(false);

  useEffect(() => {
    if (Number.isNaN(id)) {
      setInjury(null);
      setError(`Cannot open injury: invalid id "${idValue ?? ''}"`);
      return;
    }

    let cancelled = false;
    loadThread(db, id)
      .then((loaded) => {
        if (cancelled) {
          return;
        }
        if (loaded.injury == null) {
          setInjury(null);
          setError(`Cannot open injury: not found (${id})`);
          return;
        }
        setError(null);
        setInjury(loaded.injury);
        setComments(loaded.comments);
        setSolutions(loaded.solutions);
        setReadings(loaded.readings);
        setEvents(loaded.events);
        setEventLabels(loaded.eventLabels);
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
  const trimmedComment = commentBody.trim();
  const trimmedSolution = solutionBody.trim();
  const trimmedSeverity = severityText.trim();
  const parsedSeverity = parseSeverityInput(trimmedSeverity);
  const isOpen = injury?.status === 'open';

  async function reloadSolutionsAndEvents() {
    const [nextSolutions, nextEvents] = await Promise.all([
      listSolutionsForInjury(db, id),
      listEventsForInjury(db, id),
    ]);
    const labels = await labelsForEvents(db, nextEvents);
    setSolutions(nextSolutions);
    setEvents(nextEvents);
    setEventLabels(labels);
  }

  async function onAddComment() {
    if (addingComment.current || trimmedComment.length === 0 || Number.isNaN(id) || !isOpen) {
      return;
    }
    addingComment.current = true;
    try {
      await createComment(db, { injuryId: id, body: commentBody });
      const next = await listCommentsForInjury(db, id);
      setComments(next);
      setCommentBody('');
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot add comment');
    } finally {
      addingComment.current = false;
    }
  }

  async function onAddSolution() {
    if (addingSolution.current || trimmedSolution.length === 0 || Number.isNaN(id) || !isOpen) {
      return;
    }
    addingSolution.current = true;
    try {
      await createSolution(db, { injuryId: id, body: solutionBody, url: solutionUrl });
      await reloadSolutionsAndEvents();
      setSolutionBody('');
      setSolutionUrl('');
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot add solution');
    } finally {
      addingSolution.current = false;
    }
  }

  async function onAddReading() {
    if (addingReading.current || parsedSeverity == null || Number.isNaN(id) || !isOpen) {
      return;
    }
    addingReading.current = true;
    try {
      await createSeverityReading(db, { injuryId: id, value: parsedSeverity });
      const next = await listSeverityReadingsForInjury(db, id);
      setReadings(next);
      setSeverityText('');
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot add severity reading');
    } finally {
      addingReading.current = false;
    }
  }

  async function onRemoveSolution(solutionId: number) {
    if (removingSolution.current || Number.isNaN(id) || !isOpen) {
      return;
    }
    removingSolution.current = true;
    try {
      await removeSolution(db, solutionId);
      await reloadSolutionsAndEvents();
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot remove solution');
    } finally {
      removingSolution.current = false;
    }
  }

  async function onArchive() {
    if (statusAction.current || Number.isNaN(id) || !isOpen) {
      return;
    }
    statusAction.current = true;
    try {
      await archiveInjury(db, id);
      setError(null);
      router.back();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot archive injury');
      statusAction.current = false;
    }
  }

  async function onReopen() {
    if (statusAction.current || Number.isNaN(id) || injury?.status !== 'archived') {
      return;
    }
    statusAction.current = true;
    try {
      const next = await reopenInjury(db, id);
      setInjury(next);
      const nextEvents = await listEventsForInjury(db, id);
      const labels = await labelsForEvents(db, nextEvents);
      setEvents(nextEvents);
      setEventLabels(labels);
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot reopen injury');
    } finally {
      statusAction.current = false;
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
      <Stack.Screen options={{ title: landmark?.name ?? 'Injury' }} />
      <ThemedView style={styles.screen}>
        {injury === undefined ? null : error != null && injury == null ? (
          <ThemedText>{error}</ThemedText>
        ) : injury == null ? (
          <ThemedText>{error ?? 'Cannot open injury.'}</ThemedText>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scroll}>
            <ThemedText type="smallBold">
              {landmark == null ? injury.landmarkId : formatLandmarkLabel(landmark, injury.limb)}
            </ThemedText>
            <ThemedText>{injury.description}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {new Date(injury.createdAt).toLocaleString()}
            </ThemedText>
            {injury.status === 'archived' && injury.archivedAt != null ? (
              <ThemedText type="small" themeColor="textSecondary">
                Archived {new Date(injury.archivedAt).toLocaleString()}
              </ThemedText>
            ) : null}
            {error != null ? <ThemedText>{error}</ThemedText> : null}

            {injury.status === 'open' ? (
              <Pressable
                accessibilityRole="button"
                onPress={onArchive}
                style={({ pressed }) => [
                  styles.statusAction,
                  { backgroundColor: theme.backgroundSelected },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold">Archive</ThemedText>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={onReopen}
                style={({ pressed }) => [
                  styles.statusAction,
                  { backgroundColor: theme.backgroundSelected },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold">Reopen</ThemedText>
              </Pressable>
            )}

            <ThemedText type="smallBold">Solutions</ThemedText>
            {solutions.map((solution) => (
              <ThemedView key={solution.id} type="backgroundElement" style={styles.card}>
                <ThemedText>{solution.body}</ThemedText>
                {solution.url != null && isHttpUrl(solution.url) ? (
                  <SolutionLink url={solution.url} onOpen={onOpenUrl} />
                ) : null}
                <ThemedText type="small" themeColor="textSecondary">
                  {new Date(solution.createdAt).toLocaleString()}
                </ThemedText>
                {isOpen ? (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => onRemoveSolution(solution.id)}
                    style={({ pressed }) => pressed && styles.pressed}>
                    <ThemedText type="smallBold">Remove</ThemedText>
                  </Pressable>
                ) : null}
              </ThemedView>
            ))}
            {isOpen ? (
              <>
                <ThemedText type="small" themeColor="textSecondary">
                  Add solution
                </ThemedText>
                <TextInput
                  accessibilityLabel="Solution"
                  multiline
                  textAlignVertical="top"
                  value={solutionBody}
                  onChangeText={setSolutionBody}
                  style={[styles.input, styles.inputShort, inputColors(theme)]}
                />
                <ThemedText type="small" themeColor="textSecondary">
                  URL (optional)
                </ThemedText>
                <TextInput
                  accessibilityLabel="URL (optional)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  value={solutionUrl}
                  onChangeText={setSolutionUrl}
                  style={[styles.input, inputColors(theme)]}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={trimmedSolution.length === 0}
                  onPress={onAddSolution}
                  style={({ pressed }) => [
                    styles.save,
                    { backgroundColor: theme.backgroundSelected },
                    (trimmedSolution.length === 0 || pressed) && styles.pressed,
                  ]}>
                  <ThemedText type="smallBold">Add solution</ThemedText>
                </Pressable>
              </>
            ) : null}

            <ThemedText type="smallBold">Severity</ThemedText>
            {readings.length >= 2 ? (
              <SeverityTrendChart readings={readings} stroke={theme.text} />
            ) : null}
            {readings.length === 0 ? (
              <ThemedText type="small" themeColor="textSecondary">
                No severity readings yet.
              </ThemedText>
            ) : (
              readings.map((reading) => (
                <ThemedView key={reading.id} type="backgroundElement" style={styles.card}>
                  <ThemedText>{reading.value} / 10</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {new Date(reading.createdAt).toLocaleString()}
                  </ThemedText>
                </ThemedView>
              ))
            )}
            {isOpen ? (
              <>
                <ThemedText type="small" themeColor="textSecondary">
                  Severity 0–10
                </ThemedText>
                <TextInput
                  accessibilityLabel="Severity 0–10"
                  keyboardType="number-pad"
                  value={severityText}
                  onChangeText={setSeverityText}
                  style={[styles.input, inputColors(theme)]}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={parsedSeverity == null}
                  onPress={onAddReading}
                  style={({ pressed }) => [
                    styles.save,
                    { backgroundColor: theme.backgroundSelected },
                    (parsedSeverity == null || pressed) && styles.pressed,
                  ]}>
                  <ThemedText type="smallBold">Add</ThemedText>
                </Pressable>
              </>
            ) : null}

            <ThemedText type="smallBold">Comments</ThemedText>
            {comments.map((comment) => (
              <ThemedView key={comment.id} type="backgroundElement" style={styles.card}>
                <ThemedText>{comment.body}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {new Date(comment.createdAt).toLocaleString()}
                </ThemedText>
              </ThemedView>
            ))}
            {isOpen ? (
              <>
                <ThemedText type="small" themeColor="textSecondary">
                  Add comment
                </ThemedText>
                <TextInput
                  accessibilityLabel="Comment"
                  multiline
                  textAlignVertical="top"
                  value={commentBody}
                  onChangeText={setCommentBody}
                  style={[styles.input, styles.inputShort, inputColors(theme)]}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={trimmedComment.length === 0}
                  onPress={onAddComment}
                  style={({ pressed }) => [
                    styles.save,
                    { backgroundColor: theme.backgroundSelected },
                    (trimmedComment.length === 0 || pressed) && styles.pressed,
                  ]}>
                  <ThemedText type="smallBold">Add comment</ThemedText>
                </Pressable>
              </>
            ) : null}

            <ThemedText type="smallBold">History</ThemedText>
            {events.map((event) => (
              <ThemedView key={event.id} type="backgroundElement" style={styles.card}>
                <ThemedText>{eventLabels[event.id] ?? eventTypeLabel(event.type)}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {new Date(event.createdAt).toLocaleString()}
                </ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        )}
      </ThemedView>
    </>
  );
}

function parseSeverityInput(text: string): number | null {
  if (text.length === 0) {
    return null;
  }
  if (!/^\d{1,2}$/.test(text)) {
    return null;
  }
  const value = Number(text);
  if (!Number.isInteger(value) || value < 0 || value > 10) {
    return null;
  }
  return value;
}

function SeverityTrendChart({
  readings,
  stroke,
}: {
  readings: SeverityReading[];
  stroke: string;
}) {
  const width = 280;
  const height = 72;
  const padX = 8;
  const padY = 8;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const last = readings.length - 1;
  const points = readings
    .map((reading, index) => {
      const x = padX + (last === 0 ? innerW / 2 : (index / last) * innerW);
      const y = padY + innerH - (reading.value / 10) * innerH;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View style={styles.chart} accessibilityLabel="Severity trend">
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Polyline points={points} fill="none" stroke={stroke} strokeWidth={2} />
      </Svg>
    </View>
  );
}

function SolutionLink({ url, onOpen }: { url: string; onOpen: (url: string) => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => onOpen(url)}
      style={({ pressed }) => pressed && styles.pressed}>
      <ThemedText type="linkPrimary">{url}</ThemedText>
    </Pressable>
  );
}

function eventTypeLabel(type: InjuryEvent['type']): string {
  switch (type) {
    case 'created':
      return 'Created';
    case 'archived':
      return 'Archived';
    case 'reopened':
      return 'Reopened';
    case 'solution_added':
      return 'Solution added';
    case 'solution_removed':
      return 'Solution removed';
  }
}

async function labelsForEvents(
  db: SQLiteDatabase,
  events: InjuryEvent[],
): Promise<Record<number, string>> {
  const labels: Record<number, string> = {};
  for (const event of events) {
    const base = eventTypeLabel(event.type);
    if (
      (event.type === 'solution_added' || event.type === 'solution_removed') &&
      event.solutionId != null
    ) {
      const solution = await getSolutionById(db, event.solutionId);
      labels[event.id] =
        solution == null ? base : `${base}: ${solution.body.trim() || `#${event.solutionId}`}`;
    } else {
      labels[event.id] = base;
    }
  }
  return labels;
}

async function loadThread(
  db: SQLiteDatabase,
  id: number,
): Promise<{
  injury: Injury | null;
  comments: Comment[];
  solutions: Solution[];
  readings: SeverityReading[];
  events: InjuryEvent[];
  eventLabels: Record<number, string>;
}> {
  const injury = await getInjuryById(db, id);
  if (injury == null) {
    return {
      injury: null,
      comments: [],
      solutions: [],
      readings: [],
      events: [],
      eventLabels: {},
    };
  }
  const [comments, solutions, readings, events] = await Promise.all([
    listCommentsForInjury(db, id),
    listSolutionsForInjury(db, id),
    listSeverityReadingsForInjury(db, id),
    listEventsForInjury(db, id),
  ]);
  const eventLabels = await labelsForEvents(db, events);
  return { injury, comments, solutions, readings, events, eventLabels };
}

function inputColors(theme: { text: string; backgroundElement: string }) {
  return { color: theme.text, backgroundColor: theme.backgroundElement };
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.three,
    gap: Spacing.two,
    paddingBottom: Spacing.six,
  },
  card: {
    gap: Spacing.one,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  chart: {
    height: 72,
    marginVertical: Spacing.one,
  },
  input: {
    minHeight: 48,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  inputShort: {
    minHeight: 96,
  },
  save: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  statusAction: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    marginVertical: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
});
