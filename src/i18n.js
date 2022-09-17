import { i18n } from '@lingui/core';
import { de, en, es, et, fi, nl } from 'make-plural/plurals';

export const locales = {
  de: 'German',
  en: 'English',
  es: 'Spanish',
  et: 'Estonian',
  fi: 'Finnish',
  nl: 'Dutch',
};
export const defaultLocale = 'en';

i18n.loadLocaleData({
  de: { plurals: de },
  en: { plurals: en },
  es: { plurals: es },
  et: { plurals: et },
  fi: { plurals: fi },
  nl: { plurals: nl },
});

/**
 * We do a dynamic import of just the catalog that we need
 * @param locale any locale string
 */
export async function dynamicActivate(locale) {
  const { messages } = await import(`./locales/${locale}/messages`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}
