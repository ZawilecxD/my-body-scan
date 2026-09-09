import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono/600SemiBold';
import { Manrope_600SemiBold } from '@expo-google-fonts/manrope/600SemiBold';
import { Manrope_700Bold } from '@expo-google-fonts/manrope/700Bold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { useMemo, useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { migrate } from '@/db/migrate';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

async function onInit(db: SQLiteDatabase) {
  try {
    await migrate(db);
  } finally {
    await SplashScreen.hideAsync();
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [dbError, setDbError] = useState<Error | null>(null);

  const [fontsLoaded, fontError] = useFonts({
    Manrope_600SemiBold,
    Manrope_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  const fontsReady = fontsLoaded || fontError != null;

  const navigationTheme = useMemo(() => {
    const palette = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const base = colorScheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: palette.primary,
        background: palette.background,
        card: palette.surface,
        text: palette.onSurface,
        border: palette.outlineVariant,
        notification: palette.tertiary,
      },
    };
  }, [colorScheme]);

  return (
    <ThemeProvider value={navigationTheme}>
      {dbError != null ? (
        <ThemedView style={styles.screen}>
          <ThemedText>Cannot open the injury database: {dbError.message}</ThemedText>
        </ThemedView>
      ) : (
        <SQLiteProvider databaseName="my-body-scan.db" onInit={onInit} onError={setDbError}>
          {fontsReady ? (
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="map/[region]" />
              <Stack.Screen name="injuries/[id]" />
              <Stack.Screen name="injuries/new" />
              <Stack.Screen name="landmarks/index" />
              <Stack.Screen name="landmarks/[id]" />
              <Stack.Screen name="illnesses/new" />
              <Stack.Screen name="illnesses/[id]" />
              <Stack.Screen name="summary" />
              <Stack.Screen name="backup" />
            </Stack>
          ) : null}
        </SQLiteProvider>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: Spacing.three,
  },
});
