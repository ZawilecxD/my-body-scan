import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton, Chip, TextField } from '@/components/ui';
import { Radii, Spacing } from '@/constants/theme';
import { createInjury } from '@/db/injuries';
import { formatLandmarkLabel, getLandmarkById, parseLimb } from '@/domain/landmarks';
import { useTheme } from '@/hooks/use-theme';

export default function NewInjuryScreen() {
  const { landmarkId: landmarkIdParam, limb: limbParam } = useLocalSearchParams<{
    landmarkId?: string | string[];
    limb?: string | string[];
  }>();
  const landmarkId = Array.isArray(landmarkIdParam) ? landmarkIdParam[0] : landmarkIdParam;
  const landmark = landmarkId == null ? undefined : getLandmarkById(landmarkId);
  const limb = parseLimb(Array.isArray(limbParam) ? limbParam[0] : limbParam);

  const db = useSQLiteContext();
  const router = useRouter();
  const theme = useTheme();
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const saving = useRef(false);
  const [isSaving, setIsSaving] = useState(false);

  const trimmed = description.trim();
  const canSave = trimmed.length > 0 && !isSaving;
  const missingLandmark = landmarkId == null || landmark == null;

  async function onSave() {
    if (!canSave || landmarkId == null || saving.current) {
      return;
    }
    saving.current = true;
    setIsSaving(true);
    setError(null);
    try {
      const injury = await createInjury(db, { landmarkId, description, limb });
      router.dismissTo('/(tabs)');
      router.push(`/injuries/${injury.id}`);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot save injury');
      saving.current = false;
      setIsSaving(false);
    }
  }

  return (
    <ThemedView style={[styles.screen, { backgroundColor: theme.surface }]}>
      <View style={styles.chrome}>
        <AppButton
          label="Cancel"
          variant="ghost"
          onPress={() => {
            if (saving.current) {
              return;
            }
            router.back();
          }}
          style={styles.chromeButton}
        />
        <ThemedText type="labelMd" themeColor="primary">
          Rapid Log
        </ThemedText>
        <AppButton
          label={isSaving ? 'Saving' : 'Save'}
          variant="primary"
          disabled={!canSave || missingLandmark}
          onPress={onSave}
          style={styles.chromeButton}
        />
      </View>

      {missingLandmark ? (
        <ThemedText>
          Cannot log injury: landmark is missing or unknown
          {landmarkId == null ? '' : ` (${landmarkId})`}.
        </ThemedText>
      ) : (
        <>
          <Chip label={formatLandmarkLabel(landmark, limb)} selected />
          <ThemedText type="bodySm" themeColor="textSecondary">
            Describe what you feel. Pain score comes later on the injury thread.
          </ThemedText>
          <TextField
            label="Description"
            accessibilityLabel="Description"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
            style={styles.description}
          />
          {error != null ? <ThemedText themeColor="error">{error}</ThemedText> : null}
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.spaceMd,
    gap: Spacing.spaceSm,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
  },
  chrome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.spaceXs,
    marginBottom: Spacing.spaceXs,
  },
  chromeButton: {
    minWidth: 88,
    minHeight: 40,
    paddingHorizontal: Spacing.spaceSm,
  },
  description: {
    flex: 1,
    minHeight: 140,
  },
});
