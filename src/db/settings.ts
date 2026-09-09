import type { SQLiteDatabase } from 'expo-sqlite';

export type LocalePreference = 'system' | 'en' | 'pl';

const LOCALE_PREFERENCE_KEY = 'locale_preference';

export function isLocalePreference(value: string): value is LocalePreference {
  return value === 'system' || value === 'en' || value === 'pl';
}

export async function getLocalePreference(db: SQLiteDatabase): Promise<LocalePreference> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    [LOCALE_PREFERENCE_KEY],
  );
  if (row == null || !isLocalePreference(row.value)) {
    return 'system';
  }
  return row.value;
}

export async function setLocalePreference(
  db: SQLiteDatabase,
  preference: LocalePreference,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO app_settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [LOCALE_PREFERENCE_KEY, preference],
  );
}
