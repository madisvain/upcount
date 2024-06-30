import isNumber from "lodash/isNumber";

// @ts-expect-error - Intl supportedValuesOf support?
export const currencies = Intl.supportedValuesOf("currency");

export const getCurrencySymbol = (locale: string, currency: string) => {
  const numberFormat = new Intl.NumberFormat(locale, { style: "currency", currency });

  const parts = numberFormat.formatToParts(1);
  const partValues = parts.map((p) => p.value);
  return partValues[0];
};

export const getFormattedNumber = (number: number, currency: string, locale: string, organization: any) => {
  if (!isNumber(number)) return "-";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: organization.minimum_fraction_digits,
  }).format(number);
};
