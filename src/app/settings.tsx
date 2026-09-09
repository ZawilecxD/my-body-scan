import { Stack } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import type { LocalePreference } from '@/db/settings';
import { useTheme } from '@/hooks/use-theme';
import { useLocale } from '@/i18n/locale-context';

const PREFERENCES: LocalePreference[] = ['system', 'en', 'pl'];

export default function SettingsScreen() {
  const theme = useTheme();
  const { preference, setPreference, t } = useLocale();

  return (
    <>
      <Stack.Screen options={{ title: t('settings.title') }} />
      <ThemedView style={styles.screen}>
        <ThemedText type="smallBold">{t('settings.language')}</ThemedText>
        <ThemedView style={styles.options}>
          {PREFERENCES.map((value) => {
            const selected = preference === value;
            return (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  void setPreference(value);
                }}
                style={({ pressed }) => [
                  styles.option,
                  selected && { backgroundColor: theme.backgroundSelected },
                  pressed && styles.pressed,
                ]}>
                <ThemedText type={selected ? 'smallBold' : 'small'}>
                  {preferenceLabel(value, t)}
                </ThemedText>
              </Pressable>
            );
          })}
        </ThemedView>
        <ThemedText type="small" themeColor="textSecondary">
          {t('settings.language.hint')}
        </ThemedText>
      </ThemedView>
    </>
  );
}

function preferenceLabel(
  preference: LocalePreference,
  t: ReturnType<typeof useLocale>['t'],
): string {
  switch (preference) {
    case 'system':
      return t('settings.language.system');
    case 'en':
      return t('settings.language.en');
    case 'pl':
      return t('settings.language.pl');
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  options: {
    gap: Spacing.two,
  },
  option: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
