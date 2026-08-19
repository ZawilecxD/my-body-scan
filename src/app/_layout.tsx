import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { migrate } from '@/db/migrate';

SplashScreen.preventAutoHideAsync();

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

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {dbError != null ? (
        <ThemedView style={styles.screen}>
          <ThemedText>Cannot open the injury database: {dbError.message}</ThemedText>
        </ThemedView>
      ) : (
        <SQLiteProvider databaseName="my-body-scan.db" onInit={onInit} onError={setDbError}>
          <Stack />
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
