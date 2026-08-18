import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { migrate } from '@/db/migrate';

SplashScreen.preventAutoHideAsync();

async function onInit(db: SQLiteDatabase) {
  await migrate(db);
  await SplashScreen.hideAsync();
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SQLiteProvider databaseName="my-body-scan.db" onInit={onInit}>
        <Stack />
      </SQLiteProvider>
    </ThemeProvider>
  );
}
