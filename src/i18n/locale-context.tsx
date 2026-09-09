import { getLocales } from 'expo-localization';
import { useSQLiteContext } from 'expo-sqlite';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import {
  getLocalePreference,
  setLocalePreference,
  type LocalePreference,
} from '@/db/settings';
import {
  createI18n,
  createTranslate,
  resolveLocale,
  type AppLocale,
  type TranslateFn,
} from '@/i18n';

type LocaleContextValue = {
  preference: LocalePreference;
  resolvedLocale: AppLocale;
  setPreference: (preference: LocalePreference) => Promise<void>;
  t: TranslateFn;
  ready: boolean;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readDeviceLanguageCode(): string | null {
  return getLocales()[0]?.languageCode ?? null;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [preference, setPreferenceState] = useState<LocalePreference>('system');
  const [deviceLanguageCode, setDeviceLanguageCode] = useState<string | null>(readDeviceLanguageCode);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getLocalePreference(db)
      .then((value) => {
        if (!cancelled) {
          setPreferenceState(value);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreferenceState('system');
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [db]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setDeviceLanguageCode(readDeviceLanguageCode());
      }
    });
    return () => subscription.remove();
  }, []);

  const resolvedLocale = useMemo(
    () => resolveLocale(preference, deviceLanguageCode),
    [preference, deviceLanguageCode],
  );

  const t = useMemo(() => createTranslate(createI18n(resolvedLocale)), [resolvedLocale]);

  const setPreference = useCallback(
    async (next: LocalePreference) => {
      await setLocalePreference(db, next);
      setPreferenceState(next);
    },
    [db],
  );

  const value = useMemo(
    () => ({
      preference,
      resolvedLocale,
      setPreference,
      t,
      ready,
    }),
    [preference, resolvedLocale, setPreference, t, ready],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const value = useContext(LocaleContext);
  if (value == null) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return value;
}
