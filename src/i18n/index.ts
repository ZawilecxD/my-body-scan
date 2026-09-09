import { I18n, type TranslateOptions } from 'i18n-js';

import type { LocalePreference } from '@/db/settings';
import { en, type MessageKey } from '@/i18n/messages/en';
import { pl } from '@/i18n/messages/pl';

export type AppLocale = 'en' | 'pl';

export type TranslateFn = (key: MessageKey, options?: TranslateOptions) => string;

export function resolveLocale(
  preference: LocalePreference,
  deviceLanguageCode: string | null | undefined,
): AppLocale {
  if (preference === 'en' || preference === 'pl') {
    return preference;
  }
  if (deviceLanguageCode === 'en' || deviceLanguageCode === 'pl') {
    return deviceLanguageCode;
  }
  return 'en';
}

export function createI18n(locale: AppLocale): I18n {
  const i18n = new I18n({ en, pl });
  i18n.defaultLocale = 'en';
  i18n.enableFallback = true;
  i18n.locale = locale;
  return i18n;
}

export function createTranslate(i18n: I18n): TranslateFn {
  return (key, options) => i18n.t(key, options);
}
