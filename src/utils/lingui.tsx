import { i18n } from "@lingui/core";
import dayjs from "dayjs";

export const locales = ["en", "et"];

export const defaultLocale = "en";

// Initialize i18n synchronously with empty messages to prevent race conditions
// This ensures i18n.activate() is called before any translation functions
i18n.load(defaultLocale, {});
i18n.activate(defaultLocale);

// Load actual messages asynchronously and update
(async () => {
  try {
    const { messages } = await import(`../locales/${defaultLocale}.po`);
    i18n.load(defaultLocale, messages);
    i18n.activate(defaultLocale);
  } catch (error) {
    console.warn(`Failed to load default messages:`, error);
  }
})();

export async function dynamicActivate(locale: string) {
  const { messages } = await import(`../locales/${locale}.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
  dayjs.locale(locale);
}
