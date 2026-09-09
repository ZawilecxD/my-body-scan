import { Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { dumpBackup, parseBackupJson, replaceFromBackup } from '@/db/backup';
import { useTheme } from '@/hooks/use-theme';
import type { TranslateFn } from '@/i18n';
import { useLocale } from '@/i18n/locale-context';

export default function BackupScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { t } = useLocale();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const exporting = useRef(false);
  const restoring = useRef(false);

  async function onExport() {
    if (exporting.current) {
      return;
    }
    exporting.current = true;
    setError(null);
    setMessage(null);

    try {
      const payload = await dumpBackup(db);
      const stamp = formatFileStamp(new Date());
      const file = new File(Paths.cache, `my-body-scan-backup-${stamp}.json`);
      if (file.exists) {
        file.delete();
      }
      await file.write(JSON.stringify(payload, null, 2));

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error(t('common.sharingUnavailable'));
      }

      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: t('backup.exportDialog'),
      });
      setMessage(t('backup.exported', { count: payload.injuries.length }));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : t('backup.exportError'));
    } finally {
      exporting.current = false;
    }
  }

  async function onRestore() {
    if (restoring.current) {
      return;
    }
    restoring.current = true;
    setError(null);
    setMessage(null);

    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/json', 'text/plain'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (picked.canceled || picked.assets == null || picked.assets.length === 0) {
        return;
      }

      const asset = picked.assets[0];
      const text = await new File(asset.uri).text();
      const payload = parseBackupJson(text);

      const confirmed = await confirmReplace(payload.injuries.length, t);
      if (!confirmed) {
        return;
      }

      await replaceFromBackup(db, payload);
      setMessage(t('backup.restored', { count: payload.injuries.length }));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : t('backup.restoreError'));
    } finally {
      restoring.current = false;
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: t('backup.title') }} />
      <ThemedView style={styles.screen}>
        <Pressable
          accessibilityRole="button"
          onPress={onExport}
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: theme.backgroundSelected },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold">{t('backup.export')}</ThemedText>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onRestore}
          style={({ pressed }) => [
            styles.action,
            { backgroundColor: theme.backgroundSelected },
            pressed && styles.pressed,
          ]}>
          <ThemedText type="smallBold">{t('backup.restore')}</ThemedText>
        </Pressable>

        {message != null ? <ThemedText>{message}</ThemedText> : null}
        {error != null ? <ThemedText>{error}</ThemedText> : null}
      </ThemedView>
    </>
  );
}

function confirmReplace(injuryCount: number, t: TranslateFn): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      t('backup.replaceTitle'),
      t('backup.replaceBody', { count: injuryCount }),
      [
        { text: t('common.cancel'), style: 'cancel', onPress: () => resolve(false) },
        { text: t('backup.replace'), style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

function formatFileStamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  action: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
