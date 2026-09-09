import { Stack } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppButton, Card, Chip, SegmentedControl } from '@/components/ui';
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
  type SummaryWindowPreset,
} from '@/domain/summary';
import { useTheme } from '@/hooks/use-theme';

export default function SummaryScreen() {
  const db = useSQLiteContext();
  const theme = useTheme();
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
      const document = await loadSummary(db, config, now);
      setPreviewText(formatSummaryText(document));
      setPreviewHtml(formatSummaryHtml(document));
    } catch (caught: unknown) {
      setPreviewText(null);
      setPreviewHtml(null);
      setError(caught instanceof Error ? caught.message : 'Cannot generate summary');
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
        title: 'Physio summary',
      });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot share summary');
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
        throw new Error('Sharing is not available on this device');
      }
      await Sharing.shareAsync(shareFile.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Physio summary',
        UTI: '.pdf',
      });
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Cannot share PDF');
    } finally {
      sharingPdf.current = false;
    }
  }

  const canShare = previewText != null && previewHtml != null;
  const windowOptions = SUMMARY_WINDOW_PRESETS.map((preset) => ({
    value: preset,
    label: windowPresetLabel(preset),
  }));

  return (
    <>
      <Stack.Screen options={{ title: 'Summary' }} />
      <ThemedView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.intro}>
            <ThemedText type="titleMd">Physio briefing</ThemedText>
            <ThemedText type="bodyMd" themeColor="textSecondary">
              Generate a clean, focused brief of your open and past injuries to share with your
              physical therapist or trainer.
            </ThemedText>
          </Card>

          <ThemedText type="labelMd" themeColor="textSecondary">
            Time window
          </ThemedText>
          <SegmentedControl
            options={windowOptions}
            value={config.windowPreset}
            onChange={(preset: SummaryWindowPreset) => updateConfig({ windowPreset: preset })}
          />

          <ThemedText type="labelMd" themeColor="textSecondary">
            Status scope
          </ThemedText>
          <View style={styles.wrapRow}>
            <Chip
              label={statusScopeLabel(false)}
              selected={!config.includeArchived}
              onPress={() => updateConfig({ includeArchived: false })}
            />
            <Chip
              label={statusScopeLabel(true)}
              selected={config.includeArchived}
              onPress={() => updateConfig({ includeArchived: true })}
            />
          </View>

          <ThemedText type="labelMd" themeColor="textSecondary">
            Sections
          </ThemedText>
          <Card style={styles.sections}>
            <CheckboxRow
              label="Description"
              checked={config.includeDescription}
              onPress={() => updateConfig({ includeDescription: !config.includeDescription })}
            />
            <CheckboxRow
              label="Latest severity"
              checked={config.includeLatestSeverity}
              onPress={() =>
                updateConfig({ includeLatestSeverity: !config.includeLatestSeverity })
              }
            />
            <CheckboxRow
              label="Solutions"
              checked={config.includeSolutions}
              onPress={() => updateConfig({ includeSolutions: !config.includeSolutions })}
            />
            <CheckboxRow
              label="Comments"
              checked={config.includeComments}
              onPress={() => updateConfig({ includeComments: !config.includeComments })}
            />
          </Card>

          <AppButton label="Generate" onPress={onGenerate} />

          {error != null ? <ThemedText themeColor="error">{error}</ThemedText> : null}

          {previewText != null ? (
            <Card style={styles.preview} elevated>
              <ThemedText type="titleMd">Live document preview</ThemedText>
              <ThemedText type="dataSm" themeColor="textSecondary">
                {windowPresetLabel(config.windowPreset)} · {statusScopeLabel(config.includeArchived)}
              </ThemedText>
              <ThemedText type="bodyMd">{previewText}</ThemedText>
            </Card>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.outlineVariant,
            },
          ]}>
          <AppButton
            label="Share text"
            variant="ghost"
            disabled={!canShare}
            onPress={onShareText}
            style={styles.footerButton}
          />
          <AppButton
            label="Export PDF"
            disabled={!canShare}
            onPress={onSharePdf}
            style={styles.footerButton}
          />
        </View>
      </ThemedView>
    </>
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
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      hitSlop={Spacing.one}
      onPress={onPress}
      style={({ pressed }) => [styles.checkboxRow, pressed && styles.pressed]}>
      <View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? theme.primary : theme.outlineVariant,
            backgroundColor: checked ? theme.primaryContainer : 'transparent',
          },
        ]}>
        {checked ? (
          <ThemedText type="labelMd" style={{ color: theme.onPrimary }}>
            ✓
          </ThemedText>
        ) : null}
      </View>
      <ThemedText type="bodyMd">{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.spaceMd,
    gap: Spacing.spaceSm,
    paddingBottom: Spacing.spaceXl,
  },
  intro: {
    gap: Spacing.spaceXs,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.spaceXs,
  },
  sections: {
    gap: Spacing.spaceXs,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.spaceSm,
    minHeight: 44,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    gap: Spacing.spaceXs,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.spaceXs,
    paddingHorizontal: Spacing.spaceMd,
    paddingVertical: Spacing.spaceSm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});

function formatFileStamp(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}
