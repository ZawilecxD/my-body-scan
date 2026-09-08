import { Stack, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createIllness } from '@/db/illnesses';
import { useTheme } from '@/hooks/use-theme';

export default function NewIllnessScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const saving = useRef(false);

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0;

  async function onSave() {
    if (!canSave || saving.current) {
      return;
    }
    saving.current = true;
    setError(null);
    try {
      const illness = await createIllness(db, { name, notes });
      router.replace(`/illnesses/${illness.id}`);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot save illness');
      saving.current = false;
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Log illness' }} />
      <ThemedView style={styles.screen}>
        <ThemedText type="small" themeColor="textSecondary">
          Name
        </ThemedText>
        <TextInput
          accessibilityLabel="Name"
          value={name}
          onChangeText={setName}
          style={[
            styles.input,
            {
              color: theme.text,
              backgroundColor: theme.backgroundElement,
            },
          ]}
        />
        <ThemedText type="small" themeColor="textSecondary">
          Notes (optional)
        </ThemedText>
        <TextInput
          accessibilityLabel="Notes (optional)"
          multiline
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
          style={[
            styles.input,
            styles.notes,
            {
              color: theme.text,
              backgroundColor: theme.backgroundElement,
            },
          ]}
        />
        {error != null ? <ThemedText>{error}</ThemedText> : null}
        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          onPress={onSave}
          style={({ pressed }) => [
            styles.save,
            { backgroundColor: theme.backgroundSelected },
            (!canSave || pressed) && styles.pressed,
          ]}>
          <ThemedText type="smallBold">Save</ThemedText>
        </Pressable>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  input: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
  },
  notes: {
    minHeight: 120,
  },
  save: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
