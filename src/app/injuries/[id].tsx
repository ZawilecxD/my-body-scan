import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext, type SQLiteDatabase } from 'expo-sqlite';
import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton, Card, Chip, TextField } from '@/components/ui';
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

const SEVERITY_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

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
  const [historyOpen, setHistoryOpen] = useState(false);
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
  const isOpen = injury?.status === 'open';
  const latestReading = readings.length === 0 ? null : readings[readings.length - 1];

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

  async function onAddReading(value: number) {
    if (addingReading.current || Number.isNaN(id) || !isOpen) {
      return;
    }
    addingReading.current = true;
    try {
      await createSeverityReading(db, { injuryId: id, value });
      const next = await listSeverityReadingsForInjury(db, id);
      setReadings(next);
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
          <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={88}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scroll}>
              <View style={styles.statusRow}>
                <Chip label={isOpen ? 'OPEN' : 'Archived'} selected={isOpen} />
                <AppButton
                  label={isOpen ? 'Archive' : 'Reopen'}
                  variant={isOpen ? 'ghost' : 'secondary'}
                  onPress={isOpen ? onArchive : onReopen}
                  style={styles.statusButton}
                />
              </View>

              <ThemedText type="headlineMd">
                {landmark == null
                  ? injury.landmarkId
                  : formatLandmarkLabel(landmark, injury.limb)}
              </ThemedText>
              <ThemedText type="bodySm" themeColor="textSecondary">
                Logged {new Date(injury.createdAt).toLocaleString()}
                {injury.status === 'archived' && injury.archivedAt != null
                  ? ` · archived ${new Date(injury.archivedAt).toLocaleString()}`
                  : ''}
              </ThemedText>

              {error != null ? <ThemedText themeColor="error">{error}</ThemedText> : null}

              <Card style={styles.block}>
                <ThemedText type="labelMd" themeColor="textSecondary">
                  Description
                </ThemedText>
                <ThemedText type="bodyLg">{injury.description}</ThemedText>
              </Card>

              <Card style={styles.block}>
                <View style={styles.sectionHeader}>
                  <ThemedText type="titleMd">Severity</ThemedText>
                  {latestReading != null ? (
                    <ThemedText type="dataLg">{latestReading.value}/10</ThemedText>
                  ) : null}
                </View>
                {readings.length >= 2 ? (
                  <SeverityTrendChart readings={readings} stroke={theme.primary} />
                ) : null}
                {readings.length === 0 ? (
                  <ThemedText type="bodySm" themeColor="textSecondary">
                    No severity readings yet.
                  </ThemedText>
                ) : null}
                {isOpen ? (
                  <View style={styles.chipRow}>
                    {SEVERITY_VALUES.map((value) => (
                      <Chip
                        key={value}
                        label={String(value)}
                        selected={latestReading?.value === value}
                        onPress={() => onAddReading(value)}
                      />
                    ))}
                  </View>
                ) : null}
              </Card>

              <View style={styles.block}>
                <ThemedText type="titleMd">Solutions</ThemedText>
                {solutions.map((solution) => (
                  <Card key={solution.id} style={styles.itemCard}>
                    <ThemedText type="bodyMd">{solution.body}</ThemedText>
                    {solution.url != null && isHttpUrl(solution.url) ? (
                      <SolutionLink url={solution.url} onOpen={onOpenUrl} />
                    ) : null}
                    <ThemedText type="bodySm" themeColor="textSecondary">
                      {new Date(solution.createdAt).toLocaleString()}
                    </ThemedText>
                    {isOpen ? (
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => onRemoveSolution(solution.id)}
                        style={({ pressed }) => pressed && styles.pressed}>
                        <ThemedText type="labelMd" themeColor="error">
                          Remove
                        </ThemedText>
                      </Pressable>
                    ) : null}
                  </Card>
                ))}
                {isOpen ? (
                  <Card style={styles.itemCard}>
                    <TextField
                      label="Add solution"
                      accessibilityLabel="Solution"
                      multiline
                      textAlignVertical="top"
                      value={solutionBody}
                      onChangeText={setSolutionBody}
                      style={styles.inputTall}
                    />
                    <TextField
                      label="URL (optional)"
                      accessibilityLabel="URL (optional)"
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="url"
                      value={solutionUrl}
                      onChangeText={setSolutionUrl}
                    />
                    <AppButton
                      label="Add solution"
                      disabled={trimmedSolution.length === 0}
                      onPress={onAddSolution}
                    />
                  </Card>
                ) : null}
              </View>

              <View style={styles.block}>
                <ThemedText type="titleMd">Comments</ThemedText>
                {comments.length === 0 ? (
                  <ThemedText type="bodySm" themeColor="textSecondary">
                    No comments yet.
                  </ThemedText>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id} style={styles.itemCard}>
                      <ThemedText type="bodyMd">{comment.body}</ThemedText>
                      <ThemedText type="bodySm" themeColor="textSecondary">
                        {new Date(comment.createdAt).toLocaleString()}
                      </ThemedText>
                    </Card>
                  ))
                )}
              </View>

              <Card style={styles.block}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: historyOpen }}
                  onPress={() => setHistoryOpen((open) => !open)}
                  style={styles.sectionHeader}>
                  <ThemedText type="titleMd">History</ThemedText>
                  <ThemedText type="labelMd" themeColor="primary">
                    {historyOpen ? 'Hide' : 'Show'}
                  </ThemedText>
                </Pressable>
                {historyOpen
                  ? events.map((event) => (
                      <View key={event.id} style={styles.historyRow}>
                        <ThemedText type="bodyMd">
                          {eventLabels[event.id] ?? eventTypeLabel(event.type)}
                        </ThemedText>
                        <ThemedText type="bodySm" themeColor="textSecondary">
                          {new Date(event.createdAt).toLocaleString()}
                        </ThemedText>
                      </View>
                    ))
                  : null}
              </Card>
            </ScrollView>

            {isOpen ? (
              <View
                style={[
                  styles.composer,
                  {
                    backgroundColor: theme.surface,
                    borderTopColor: theme.outlineVariant,
                  },
                ]}>
                <TextField
                  accessibilityLabel="Comment"
                  placeholder="Add a comment"
                  multiline
                  textAlignVertical="top"
                  value={commentBody}
                  onChangeText={setCommentBody}
                  style={styles.composerInput}
                  containerStyle={styles.composerField}
                />
                <AppButton
                  label="Send"
                  disabled={trimmedComment.length === 0}
                  onPress={onAddComment}
                  style={styles.composerSend}
                />
              </View>
            ) : null}
          </KeyboardAvoidingView>
        )}
      </ThemedView>
    </>
  );
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.spaceMd,
    gap: Spacing.spaceSm,
    paddingBottom: Spacing.six,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.spaceSm,
  },
  statusButton: {
    minHeight: 40,
    paddingHorizontal: Spacing.spaceMd,
  },
  block: {
    gap: Spacing.spaceXs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.spaceSm,
  },
  itemCard: {
    gap: Spacing.spaceXs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.space2xs,
  },
  chart: {
    height: 72,
    marginVertical: Spacing.one,
  },
  inputTall: {
    minHeight: 96,
  },
  historyRow: {
    gap: 2,
    paddingTop: Spacing.spaceXs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.spaceXs,
    paddingHorizontal: Spacing.spaceMd,
    paddingVertical: Spacing.spaceXs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  composerField: {
    flex: 1,
  },
  composerInput: {
    minHeight: 44,
    maxHeight: 96,
  },
  composerSend: {
    minWidth: 88,
    minHeight: 44,
  },
  pressed: {
    opacity: 0.7,
  },
});
