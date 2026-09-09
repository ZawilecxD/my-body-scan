import { Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { loadSummary } from '@/db/summary';
import {
  DEFAULT_SUMMARY_CONFIG,
  formatSummaryHtml,
  formatSummaryText,
  SUMMARY_WINDOW_PRESETS,
  statusScopeLabel,
  windowPresetLabel,
  type SummaryConfig,
} from '@/domain/summary';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n/locale-context';

export default function SummaryScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
  const { t, resolvedLocale } = useLocale();
  const [config, setConfig] = useState<SummaryConfig>(DEFAULT_SUMMARY_CONFIG);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generating = useRef(false);
  const sharingText = useRef(false);
  const sharingPdf = useRef(false);

  function updateConfig(patch: Partial<SummaryConfig>) {
    setConfig((current) => ({ ...current, ...patch }));
    setPreviewText(null);
    setPreviewHtml(null);
    setError(null);
  }

  async function onGenerate() {
    if (generating.current) {
      return;
    }
    generating.current = true;
    setError(null);

    try {
      const now = new Date();
      const document = await loadSummary(db, config, now, t);
      setPreviewText(formatSummaryText(document, t, resolvedLocale));
      setPreviewHtml(formatSummaryHtml(document, t, resolvedLocale));
    } catch (caught: unknown) {
      setPreviewText(null);
      setPreviewHtml(null);
      setError(caught instanceof Error ? caught.message : t('summary.generateError'));
    } finally {
      generating.current = false;
    }
  }

  async function onShareText() {
    if (sharingText.current || previewText == null) {
      return;
    }
    sharingText.current = true;
    setError(null);

    try {
      await Share.share({
        message: previewText,
        title: t('summary.physioTitle'),
      });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : t('summary.shareError'));
    } finally {
      sharingText.current = false;
    }
  }

  async function onSharePdf() {
    if (sharingPdf.current || previewHtml == null) {
      return;
    }
    sharingPdf.current = true;
    setError(null);

    try {
      // printToFileAsync URI is often outside Sharing's FileProvider roots on Android.
      // Copy into Paths.cache (same pattern as backup export) before shareAsync.
      const { uri } = await Print.printToFileAsync({ html: previewHtml });
      const stamp = formatFileStamp(new Date());
      const shareFile = new File(Paths.cache, `physio-summary-${stamp}.pdf`);
      if (shareFile.exists) {
        shareFile.delete();
      }
      new File(uri).copy(shareFile);

      if (!(await Sharing.isAvailableAsync())) {
        throw new Error(t('common.sharingUnavailable'));
      }
      await Sharing.shareAsync(shareFile.uri, {
        mimeType: 'application/pdf',
        dialogTitle: t('summary.physioTitle'),
        UTI: '.pdf',
      });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : t('summary.pdfError'));
    } finally {
      sharingPdf.current = false;
    }
  }

  const canShare = previewText != null && previewHtml != null;

  return (
    <>
      <Stack.Screen options={{ title: t('summary.title') }} />
      <ThemedView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText themeColor="textSecondary">{t('summary.blurb')}</ThemedText>

          <ThemedText type="smallBold">{t('summary.timeWindow')}</ThemedText>
          <ThemedView style={styles.wrapRow}>
            {SUMMARY_WINDOW_PRESETS.map((preset) => (
              <OptionChip
                key={preset}
                label={windowPresetLabel(preset, t)}
                selected={config.windowPreset === preset}
                selectedBackground={theme.backgroundSelected}
                onPress={() => updateConfig({ windowPreset: preset })}
              />
            ))}
          </ThemedView>

          <ThemedText type="smallBold">{t('summary.statusScope')}</ThemedText>
          <ThemedView style={styles.wrapRow}>
            <OptionChip
              label={statusScopeLabel(false, t)}
              selected={!config.includeArchived}
              selectedBackground={theme.backgroundSelected}
              onPress={() => updateConfig({ includeArchived: false })}
            />
            <OptionChip
              label={statusScopeLabel(true, t)}
              selected={config.includeArchived}
              selectedBackground={theme.backgroundSelected}
              onPress={() => updateConfig({ includeArchived: true })}
            />
          </ThemedView>

          <ThemedText type="smallBold">{t('summary.sections')}</ThemedText>
          <CheckboxRow
            label={t('summary.description')}
            checked={config.includeDescription}
            onPress={() => updateConfig({ includeDescription: !config.includeDescription })}
          />
          <CheckboxRow
            label={t('summary.latestSeverity')}
            checked={config.includeLatestSeverity}
            onPress={() => updateConfig({ includeLatestSeverity: !config.includeLatestSeverity })}
          />
          <CheckboxRow
            label={t('summary.solutions')}
            checked={config.includeSolutions}
            onPress={() => updateConfig({ includeSolutions: !config.includeSolutions })}
          />
          <CheckboxRow
            label={t('summary.comments')}
            checked={config.includeComments}
            onPress={() => updateConfig({ includeComments: !config.includeComments })}
          />

          <Pressable
            accessibilityRole="button"
            onPress={onGenerate}
            style={({ pressed }) => [
              styles.action,
              { backgroundColor: theme.backgroundSelected },
              pressed && styles.pressed,
            ]}>
            <ThemedText type="smallBold">{t('summary.generate')}</ThemedText>
          </Pressable>

          <ThemedView style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              disabled={!canShare}
              onPress={onShareText}
              style={({ pressed }) => [
                styles.action,
                styles.actionFlex,
                { backgroundColor: theme.backgroundSelected, opacity: canShare ? 1 : 0.4 },
                pressed && canShare && styles.pressed,
              ]}>
              <ThemedText type="smallBold">{t('summary.shareText')}</ThemedText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={!canShare}
              onPress={onSharePdf}
              style={({ pressed }) => [
                styles.action,
                styles.actionFlex,
                { backgroundColor: theme.backgroundSelected, opacity: canShare ? 1 : 0.4 },
                pressed && canShare && styles.pressed,
              ]}>
              <ThemedText type="smallBold">{t('summary.sharePdf')}</ThemedText>
            </Pressable>
          </ThemedView>

          {error != null ? <ThemedText>{error}</ThemedText> : null}

          {previewText != null ? (
            <ThemedView type="backgroundElement" style={styles.preview}>
              <ThemedText type="smallBold">{t('summary.preview')}</ThemedText>
              <ThemedText>{previewText}</ThemedText>
            </ThemedView>
          ) : null}
        </ScrollView>
      </ThemedView>
    </>
  );
}

function OptionChip({
  label,
  selected,
  selectedBackground,
  onPress,
}: {
  label: string;
  selected: boolean;
  selectedBackground: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && { backgroundColor: selectedBackground },
        pressed && styles.pressed,
      ]}>
      <ThemedText type={selected ? 'smallBold' : 'small'}>{label}</ThemedText>
    </Pressable>
  );
}

function CheckboxRow({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressed]}>
      <ThemedText>{checked ? '[x]' : '[ ]'}</ThemedText>
      <ThemedText>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.three,
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  action: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionFlex: {
    flex: 1,
  },
  preview: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});

function formatFileStamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}
