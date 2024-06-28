import { i18n } from "@lingui/core";
import dayjs from "dayjs";

export const locales = ["en", "et"];

export const defaultLocale = "en";

export async function dynamicActivate(locale: string) {
  const { messages } = await import(`../locales/${locale}.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
  dayjs.locale(locale);
}
