import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { createInjury } from '@/db/injuries';
import { formatLandmarkLabel, getLandmarkById, parseLimb } from '@/domain/landmarks';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n/locale-context';

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
  const { t } = useLocale();
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const trimmed = description.trim();
  const canSave = trimmed.length > 0 && !isSaving;

  if (landmarkId == null || landmark == null) {
    return (
      <>
        <Stack.Screen options={{ title: t('injury.newTitle') }} />
        <ThemedView style={styles.screen}>
          <ThemedText>{t('landmarks.unknownBody')}</ThemedText>
        </ThemedView>
      </>
    );
  }

  async function onSave() {
    if (!canSave || landmarkId == null) {
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const injury = await createInjury(db, { landmarkId, description, limb });
      router.replace(`/injuries/${injury.id}`);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : t('injury.saveError'));
      setIsSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: t('injury.newTitle') }} />
      <ThemedView style={styles.screen}>
        <ThemedText type="smallBold">{formatLandmarkLabel(landmark, t, limb)}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('injury.description')}
        </ThemedText>
        <TextInput
          accessibilityLabel={t('injury.description')}
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
          style={[
            styles.input,
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
          <ThemedText type="smallBold">
            {isSaving ? t('common.saving') : t('common.save')}
          </ThemedText>
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
    minHeight: 160,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontSize: 16,
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
