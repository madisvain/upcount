import { i18n } from "@lingui/core";
import dayjs from "dayjs";
import { messages as enMessages } from "../locales/en.po";

export const locales = ["en", "et"];

export const defaultLocale = "en";

// Initialize i18n with default locale to prevent race conditions
i18n.load(defaultLocale, enMessages);
i18n.activate(defaultLocale);

export async function dynamicActivate(locale: string) {
  const { messages } = await import(`../locales/${locale}.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
  dayjs.locale(locale);
}
