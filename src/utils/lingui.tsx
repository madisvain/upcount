import { i18n } from "@lingui/core";
import dayjs from "dayjs";

export const locales = ["en", "et"];

export const defaultLocale = "en";

// Initialize i18n with default locale to prevent race conditions
// Load default locale messages asynchronously
(async () => {
  try {
    const { messages } = await import(`../locales/${defaultLocale}.po`);
    i18n.load(defaultLocale, messages);
    i18n.activate(defaultLocale);
  } catch (error) {
    console.warn(`Failed to load default messages:`, error);
    i18n.load(defaultLocale, {});
    i18n.activate(defaultLocale);
  }
})();

export async function dynamicActivate(locale: string) {
  const { messages } = await import(`../locales/${locale}.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
  dayjs.locale(locale);
}
