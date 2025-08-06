import { Trans } from "@lingui/react/macro";
import { I18nProvider } from "@lingui/react";
import { Document, Font, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import dayjs from "dayjs";

import { getFormattedNumber } from "src/utils/currencies";

Font.register({
  family: "Montserrat",
  fonts: [
    {
      src: "/fonts/montserrat/Montserrat-Thin.ttf",
      fontWeight: 100,
    },
    {
      src: "/fonts/montserrat/Montserrat-ExtraLight.ttf",
      fontWeight: 200,
    },
    {
      src: "/fonts/montserrat/Montserrat-Light.ttf",
      fontWeight: 300,
    },
    {
      src: "/fonts/montserrat/Montserrat-Regular.ttf",
      fontWeight: 400,
    },
    {
      src: "/fonts/montserrat/Montserrat-Medium.ttf",
      fontWeight: 500,
    },
    {
      src: "/fonts/montserrat/Montserrat-SemiBold.ttf",
      fontWeight: 600,
    },
    {
      src: "/fonts/montserrat/Montserrat-Bold.ttf",
      fontWeight: 700,
    },
    {
      src: "/fonts/montserrat/Montserrat-ExtraBold.ttf",
      fontWeight: 800,
    },
    {
      src: "/fonts/montserrat/Montserrat-Black.ttf",
      fontWeight: 900,
    },
  ],
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    padding: 50,
    fontSize: 10,
  },
  title: {
    fontFamily: "Montserrat",
    fontSize: 24,
    fontWeight: "semibold",
  },
  subtitle: {
    fontFamily: "Montserrat",
    fontSize: 12,
    marginBottom: 8,
  },
  text: {
    fontFamily: "Montserrat",
    fontSize: 10,
    marginBottom: 2,
  },
  smallText: {
    fontFamily: "Montserrat",
    fontSize: 8,
    marginBottom: 2,
  },
  medium: {
    fontFamily: "Montserrat",
    fontWeight: "medium",
  },
  bold: {
    fontFamily: "Montserrat",
    fontWeight: "bold",
  },

  /* Table */
  table: {
    // TODO: Check if can be removed
    // @ts-expect-error - "table" is not a valid display value
    display: "table",
    width: "auto",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableRowBordered: {
    borderTopStyle: "solid",
    borderRightStyle: "solid",
    borderBottomStyle: "solid",
    borderLeftStyle: "solid",
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0.5,
    borderLeftWidth: 0,
    borderBottomColor: "#868686",
  },
  tableRowBorderedBold: {
    borderBottomWidth: 2,
  },
  tableCol: {
    fontFamily: "Montserrat",
    fontSize: 8,
    padding: 8,
  },
  tableColFirst: {
    paddingLeft: 0,
  },
  tableColLast: {
    paddingRight: 0,
  },
  tableHeader: {
    fontWeight: "medium",
  },

  /* Line items */
  lineItemNumber: {
    width: "4%",
  },
  lineItemDescription: {
    width: "56%",
  },
  lineItemQuantity: {
    width: "10%",
  },
  lineItemUnitPrice: {
    width: "10%",
    textAlign: "left",
  },
  lineItemTotal: {
    width: "10%",
    textAlign: "right",
  },
  lineItemTax: {
    width: "10%",
    textAlign: "left",
  },

  notes: {
    fontFamily: "Montserrat",
    fontSize: 8,
  },

  row: {
    flexDirection: "row",
    marginBottom: 36,
  },
  column: {
    width: "50%",
  },

  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    borderTopStyle: "solid",
    borderTopWidth: 0.5,
    borderTopColor: "#868686",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

const InvoicePDF = ({
  invoice,
  client,
  organization,
  taxRates,
  i18n,
}: {
  invoice: any;
  client: any;
  organization: any;
  taxRates: any;
  i18n: any;
}) => {
  // Group line items by tax rate and calculate tax for each group
  const taxGroups = (() => {
    const groups: { [key: string]: { taxRate: any; items: any[]; subtotal: number; tax: number } } = {};

    invoice.lineItems?.forEach((item: any) => {
      if (item.total) {
        const taxRateId = item.taxRate || "no-tax";
        const taxRate = item.taxRate ? taxRates?.find((rate: any) => rate.id === taxRateId) : null;

        if (!groups[taxRateId]) {
          groups[taxRateId] = {
            taxRate,
            items: [],
            subtotal: 0,
            tax: 0,
          };
        }

        groups[taxRateId].items.push(item);
        groups[taxRateId].subtotal += item.total;
        groups[taxRateId].tax = taxRate?.percentage ? (groups[taxRateId].subtotal * taxRate.percentage) / 100 : 0;
      }
    });

    return Object.values(groups);
  })();
  return (
    <I18nProvider i18n={i18n}>
      <Document>
        <Page size="A4" style={styles.container}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.title}>
                <Trans>Invoice {invoice.number}</Trans>
              </Text>
            </View>
            <View style={[styles.column]}>
              {organization.logo && <Image src={organization.logo} style={{ maxWidth: 120, marginLeft: "auto" }} />}
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={[styles.subtitle]}>{client.name}</Text>
              <Text style={styles.smallText}>{client.address}</Text>
              {client.emails && (() => {
                // Handle both string (JSON) and array formats
                let emailsArray: string[] = [];
                try {
                  emailsArray = typeof client.emails === 'string' 
                    ? JSON.parse(client.emails) 
                    : client.emails;
                } catch (e) {
                  // If parsing fails, treat as empty array
                  emailsArray = [];
                }
                return emailsArray.length > 0 && emailsArray[0] 
                  ? <Text style={styles.smallText}>{emailsArray[0]}</Text> 
                  : null;
              })()}
              <Text style={styles.smallText}>{client.website}</Text>
            </View>
            <View style={[styles.column, { textAlign: "right" }]}>
              <Text style={[styles.subtitle]}>{organization.name}</Text>
              <Text style={styles.smallText}>{organization.address}</Text>
              <Text style={styles.smallText}>{organization.email}</Text>
              <Text style={styles.smallText}>{organization.website}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[{ width: "20%" }]}>
              <Text style={[styles.smallText, { marginBottom: 8 }]}>
                <Trans>Date</Trans>
              </Text>
              <Text style={[styles.smallText, { marginBottom: 8 }]}>
                <Trans>Due date</Trans>
              </Text>
              {invoice.overdueCharge && (
                <Text style={[styles.smallText, { marginBottom: 8 }]}>
                  <Trans>Overdue charge</Trans>
                </Text>
              )}
            </View>
            <View>
              <Text style={[styles.smallText, { marginBottom: 8 }]}>{dayjs(invoice.date).format("L")}</Text>
              <Text style={[styles.smallText, { marginBottom: 8 }]}>{dayjs(invoice.dueDate).format("L")}</Text>
              {invoice.overdueCharge && (
                <Text style={[styles.smallText, { marginBottom: 8 }]}>{invoice.overdueCharge}%</Text>
              )}
            </View>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableRowBordered, styles.tableRowBorderedBold, styles.tableHeader]}>
              <Text style={[styles.tableCol, styles.tableColFirst, styles.lineItemNumber]}>#</Text>
              <Text style={[styles.tableCol, styles.lineItemDescription]}>
                <Trans>Description</Trans>
              </Text>
              <Text style={[styles.tableCol, styles.lineItemQuantity]}>
                <Trans>Qty.</Trans>
              </Text>
              <Text style={[styles.tableCol, styles.lineItemUnitPrice]}>
                <Trans>Price</Trans>
              </Text>
              <Text style={[styles.tableCol, styles.lineItemTax]}>
                <Trans>Tax %</Trans>
              </Text>
              <Text style={[styles.tableCol, styles.tableColLast, styles.lineItemTotal]}>
                <Trans>Total</Trans>
              </Text>
            </View>
            {invoice.lineItems?.map((lineItem: any, index: number) => {
              const taxRate = taxRates?.find((rate: any) => rate.id === lineItem.taxRate);
              const isLastItem = index === invoice.lineItems.length - 1;
              return (
                <View
                  key={lineItem.id}
                  style={[
                    styles.tableRow,
                    styles.tableRowBordered,
                    ...(isLastItem ? [styles.tableRowBorderedBold] : []),
                  ]}
                >
                  <Text style={[styles.tableCol, styles.tableColFirst, styles.lineItemNumber]}>{index + 1}</Text>
                  <Text style={[styles.tableCol, styles.lineItemDescription]}>{lineItem.description}</Text>
                  <Text style={[styles.tableCol, styles.lineItemQuantity]}>{lineItem.quantity}</Text>
                  <Text style={[styles.tableCol, styles.lineItemUnitPrice]}>
                    {getFormattedNumber(lineItem.unitPrice, invoice.currency, i18n.locale, organization)}
                  </Text>
                  <Text style={[styles.tableCol, styles.lineItemTax]}>{taxRate ? `${taxRate.percentage}%` : ""}</Text>
                  <Text style={[styles.tableCol, styles.tableColLast, styles.lineItemTotal]}>
                    {getFormattedNumber(lineItem.total, invoice.currency, i18n.locale, organization)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={[styles.row, { marginTop: 20 }]}>
            <View style={[{ width: "60%" }, { paddingRight: 20 }]}>
              {invoice.customerNotes && <Text style={styles.notes}>{invoice.customerNotes}</Text>}
            </View>
            <View style={{ width: "40%" }}>
              <View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                  <Text style={[styles.smallText, styles.nowrap]}>
                    <Trans>Subtotal</Trans>
                  </Text>
                  <Text style={[styles.smallText]}>
                    {getFormattedNumber(invoice.subTotal, invoice.currency, i18n.locale, organization)}
                  </Text>
                </View>
                {taxGroups.map((group, index) => (
                  <View
                    key={`tax-${index}`}
                    style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}
                  >
                    <Text style={[styles.smallText, styles.nowrap]}>
                      {group.taxRate ? `${group.taxRate.name} ${group.taxRate.percentage}%` : <Trans>Tax 0%</Trans>}
                    </Text>
                    <Text style={[styles.smallText]}>
                      {getFormattedNumber(group.tax, invoice.currency, i18n.locale, organization)}
                    </Text>
                  </View>
                ))}
              </View>
              <View
                style={{
                  borderTopWidth: 2,
                  borderTopColor: "#868686",
                  marginTop: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 4,
                    paddingTop: 8,
                  }}
                >
                  <Text style={[styles.smallText, styles.bold, styles.nowrap]}>
                    <Trans>Total</Trans>
                  </Text>
                  <Text style={[styles.smallText, styles.bold]}>
                    {getFormattedNumber(invoice.total, invoice.currency, i18n.locale, organization)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.text]}>
              {organization.bank_name} {organization.iban}
            </Text>
            {organization.registration_number && (
              <Text style={[styles.text, { textAlign: "center" }]}>Reg. nr {organization.registration_number}</Text>
            )}
            {organization.vatin && (
              <Text style={[styles.text, { textAlign: "right" }]}>VATIN {organization.vatin}</Text>
            )}
          </View>
        </Page>
      </Document>
    </I18nProvider>
  );
};

export default InvoicePDF;
