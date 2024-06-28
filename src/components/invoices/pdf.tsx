import { Trans } from "@lingui/macro";
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
    padding: 30,
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
    // @ts-ignore
    display: "table",
    width: "auto",
    // TODO: Check if can be removed
    // @ts-ignore
    borderStyle: "none",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableRowBordered: {
    borderStyle: "solid",
    borderWidth: 0,
    borderBottomWidth: 2,
    borderColor: "#868686",
  },
  tableCol: {
    fontFamily: "Montserrat",
    padding: 8,
  },
  tableHeader: {
    fontWeight: "bold",
  },

  /* Line items */
  lineItemNumber: {
    width: "4%",
  },
  lineItemDescription: {
    width: "56%",
  },
  lineItemQuantity: {
    width: "12%",
  },
  lineItemUnitPrice: {
    width: "12%",
    textAlign: "right",
  },
  lineItemTotal: {
    width: "16%",
    textAlign: "right",
  },

  notes: {
    fontFamily: "Montserrat",
    marginTop: 20,
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
    left: 30,
    right: 30,
    borderTopWidth: 1,
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
  // TODO: Check if taxRates are needed
  if (taxRates) {
  }

  return (
    <I18nProvider i18n={i18n}>
      <Document>
        <Page size="A4" style={styles.container}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.title}>
                <Trans>Invoice #{invoice.number}</Trans>
              </Text>
            </View>
            <View style={[styles.column]}>
              <Image src={organization.logo} style={{ maxWidth: 120, marginLeft: "auto" }} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={[styles.subtitle, styles.medium]}>{client.name}</Text>
              <Text style={styles.text}>{client.address}</Text>
              <Text style={styles.text}>{client.email}</Text>
              <Text style={styles.text}>{client.website}</Text>
            </View>
            <View style={[styles.column, { textAlign: "right" }]}>
              <Text style={[styles.subtitle, styles.medium]}>{organization.name}</Text>
              <Text style={styles.text}>{organization.address}</Text>
              <Text style={styles.text}>{organization.email}</Text>
              <Text style={styles.text}>{organization.website}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[{ width: "20%" }]}>
              <Text style={[styles.medium, { marginBottom: 8 }]}>
                <Trans>Date</Trans>
              </Text>
              <Text style={[styles.medium, { marginBottom: 8 }]}>
                <Trans>Due date</Trans>
              </Text>
              {invoice.overdueCharge && (
                <Text style={[styles.medium, { marginBottom: 8 }]}>
                  <Trans>Overdue charge</Trans>
                </Text>
              )}
            </View>
            <View>
              <Text style={[styles.text, { marginBottom: 8 }]}>{dayjs(invoice.date).format("L")}</Text>
              <Text style={[styles.text, { marginBottom: 8 }]}>{dayjs(invoice.dueDate).format("L")}</Text>
              {invoice.overdueCharge && <Text style={[{ marginBottom: 8 }]}>{invoice.overdueChargePercentage}%</Text>}
            </View>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableRowBordered, styles.tableHeader]}>
              <Text style={[styles.tableCol, styles.lineItemNumber]}>#</Text>
              <Text style={[styles.tableCol, styles.lineItemDescription]}>
                <Trans>Description</Trans>
              </Text>
              <Text style={[styles.tableCol, styles.lineItemQuantity]}>
                <Trans>Qty.</Trans>
              </Text>
              <Text style={[styles.tableCol, styles.lineItemUnitPrice]}>
                <Trans>Price</Trans>
              </Text>
              <Text style={[styles.tableCol, styles.lineItemTotal]}>
                <Trans>Total</Trans>
              </Text>
            </View>
            {invoice.lineItems?.map((lineItem: any, index: number) => (
              <View key={lineItem.id} style={[styles.tableRow, styles.tableRowBordered]}>
                <Text style={[styles.tableCol, styles.lineItemNumber]}>{index + 1}</Text>
                <Text style={[styles.tableCol, styles.lineItemDescription]}>{lineItem.description}</Text>
                <Text style={[styles.tableCol, styles.lineItemQuantity]}>{lineItem.quantity}</Text>
                <Text style={[styles.tableCol, styles.lineItemUnitPrice]}>
                  {getFormattedNumber(lineItem.unitPrice, invoice.currency, i18n.locale, organization)}
                </Text>
                <Text style={[styles.tableCol, styles.lineItemTotal]}>
                  {getFormattedNumber(lineItem.total, invoice.currency, i18n.locale, organization)}
                </Text>
              </View>
            ))}

            <View key="subtotal" style={[styles.tableRow, { paddingTop: 16 }]}>
              <Text style={[styles.lineItemNumber]}></Text>
              <Text style={[styles.lineItemDescription]}></Text>
              <Text style={[styles.lineItemQuantity]}></Text>
              <Text style={[styles.tableCol, styles.lineItemUnitPrice]}>
                <Trans>Subtotal</Trans>
              </Text>
              <Text style={[styles.tableCol, styles.lineItemTotal]}>
                {getFormattedNumber(invoice.subTotal, invoice.currency, i18n.locale, organization)}
              </Text>
            </View>
            <View key="subtotal" style={styles.tableRow}>
              <Text style={[styles.lineItemNumber]}></Text>
              <Text style={[styles.lineItemDescription]}></Text>
              <Text style={[styles.lineItemQuantity]}></Text>
              <Text style={[styles.tableCol, styles.lineItemUnitPrice]}>
                <Trans>Tax</Trans>
              </Text>
              <Text style={[styles.tableCol, styles.lineItemTotal]}>
                {getFormattedNumber(invoice.taxTotal, invoice.currency, i18n.locale, organization)}
              </Text>
            </View>
            <View key="subtotal" style={styles.tableRow}>
              <Text style={[styles.lineItemNumber]}></Text>
              <Text style={[styles.lineItemDescription]}></Text>
              <Text style={[styles.lineItemQuantity]}></Text>
              <Text style={[styles.tableCol, styles.lineItemUnitPrice, styles.bold]}>
                <Trans>Total</Trans>
              </Text>
              <Text style={[styles.tableCol, styles.lineItemTotal]}>
                {getFormattedNumber(invoice.total, invoice.currency, i18n.locale, organization)}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.notes}>Thank you for your business!</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={[styles.text]}>
              {organization.bank_name} {organization.iban}
            </Text>
            <Text style={[styles.text, { textAlign: "center" }]}>Reg. nr {organization.registration_number}</Text>
            <Text style={[styles.text, { textAlign: "right" }]}>VATIN {organization.vatin}</Text>
          </View>
        </Page>
      </Document>
    </I18nProvider>
  );
};

export default InvoicePDF;
