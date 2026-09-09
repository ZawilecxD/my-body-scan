import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton, TextField } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { createIllness } from '@/db/illnesses';

export default function NewIllnessScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saving = useRef(false);

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0 && !isSaving;

  async function onSave() {
    if (!canSave || saving.current) {
      return;
    }
    saving.current = true;
    setIsSaving(true);
    setError(null);
    try {
      const illness = await createIllness(db, { name, notes });
      router.replace(`/illnesses/${illness.id}`);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot save illness');
      saving.current = false;
      setIsSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Log illness' }} />
      <ThemedView style={styles.screen}>
        <ThemedText type="bodySm" themeColor="textSecondary">
          Name is required. Notes are optional context for later episodes.
        </ThemedText>
        <TextField
          label="Name"
          accessibilityLabel="Name"
          value={name}
          onChangeText={setName}
          autoFocus
        />
        <TextField
          label="Notes (optional)"
          accessibilityLabel="Notes (optional)"
          multiline
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
          style={styles.notes}
        />
        {error != null ? <ThemedText themeColor="error">{error}</ThemedText> : null}
        <AppButton
          label={isSaving ? 'Saving' : 'Save'}
          disabled={!canSave}
          onPress={onSave}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.spaceMd,
    gap: Spacing.spaceSm,
  },
  notes: {
    minHeight: 120,
  },
});
