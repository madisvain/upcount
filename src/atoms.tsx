import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { message } from "antd";
import { nanoid } from "nanoid";
import { t } from "@lingui/macro";
import dayjs from "dayjs";
import isEqual from "lodash/isEqual";
import find from "lodash/find";
import first from "lodash/first";
import map from "lodash/map";
import omit from "lodash/omit";
import orderBy from "lodash/orderBy";
import keys from "lodash/keys";
import keyBy from "lodash/keyBy";
import values from "lodash/values";
import reject from "lodash/reject";
import { invoke } from "@tauri-apps/api/core";
import Database from "@tauri-apps/plugin-sql";

import { defaultLocale } from "src/utils/lingui";
import { centsToUnits, unitsToCents } from "src/utils/currency";

const sqlite = await Database.load("sqlite:sqlite.db");

// Generic
export const siderAtom = atomWithStorage("sider", false);
export const localeAtom = atomWithStorage("locale", defaultLocale);

// Clients
export const clientsAtom = atom<any[]>([]);
export const setClientsAtom = atom(null, async (get, set) => {
  const organizationId = get(organizationIdAtom);
  try {
    const response = await invoke<any[]>("get_clients", { organizationId });
    // Keep emails as JSON string in the clients list since the table expects it
    set(clientsAtom, response);
  } catch (error) {
    console.error("Failed to fetch clients:", error);
    message.error(t`Failed to fetch clients`);
  }
});

// Client
export const clientIdAtom = atom<string | null>(null);
export const clientAtom = atom(
  async (get) => {
    const clientId = get(clientIdAtom);
    if (!clientId) return null;

    try {
      const client = await invoke<any>("get_client", { clientId });
      if (!client) return null;
      // Parse emails from JSON string to array for the form
      return { 
        ...client, 
        emails: client?.emails ? JSON.parse(client.emails) : [] 
      };
    } catch (error) {
      console.error("Failed to fetch client:", error);
      return null;
    }
  },
  async (get, set, newValues: any) => {
    const clientId = get(clientIdAtom);

    try {
      // Convert emails array to JSON string if it's an array
      const processedValues = {
        ...newValues,
        emails: Array.isArray(newValues.emails) ? JSON.stringify(newValues.emails) : newValues.emails
      };

      if (!clientId) {
        // Insert
        processedValues.id = nanoid();
        processedValues.organizationId = get(organizationIdAtom);
        const createdClient = await invoke<any>("create_client", { 
          client: processedValues 
        });
        set(clientIdAtom, createdClient.id);
        message.success(t`Client created`);
        
        // Update the clients list
        const clients: any = get(clientsAtom);
        set(clientsAtom, orderBy([...clients, createdClient], "name", "asc"));
      } else {
        // Update
        const updatedClient = await invoke<any>("update_client", { 
          clientId,
          updates: processedValues 
        });
        message.success(t`Client updated successfully`);
        
        // Update the clients list
        const clients: any = get(clientsAtom);
        const mergedClients: any = keyBy([...clients, updatedClient], "id");
        set(clientsAtom, orderBy(map(mergedClients), "name", "asc"));
      }
    } catch (error) {
      console.error("Client operation failed:", error);
      if (!clientId) {
        message.error(t`Client creation failed`);
      } else {
        message.error(t`Client update failed`);
      }
    }
  }
);

// Delete client
export const deleteClientAtom = atom(null, async (get, set, clientId: string) => {
  try {
    const success = await invoke<boolean>("delete_client", { clientId });
    
    if (success) {
      // Remove client from the list
      const clients: any = reject(get(clientsAtom), (obj: any) => isEqual(obj.id, clientId));
      set(clientsAtom, clients);
      message.success(t`Client deleted`);
    } else {
      message.error(t`Client deletion failed`);
    }
  } catch (error) {
    console.error("Failed to delete client:", error);
    message.error(t`Client deletion failed`);
  }
});

// Invoices
export const invoicesAtom = atom<any[]>([]);
export const setInvoicesAtom = atom(null, async (get, set) => {
  const organizationId = get(organizationIdAtom);
  try {
    const response = await invoke<any[]>("get_invoices", { organizationId });
    // Convert cents to units for display
    const invoicesWithUnits = response.map(invoice => ({
      ...invoice,
      total: centsToUnits(invoice.total),
      taxTotal: centsToUnits(invoice.taxTotal),
      subTotal: centsToUnits(invoice.subTotal)
    }));
    set(invoicesAtom, invoicesWithUnits);
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
    message.error(t`Failed to fetch invoices`);
  }
});

// Invoice
export const invoiceIdAtom = atom<string | null>(null);
export const invoiceAtom = atom(
  async (get) => {
    const invoiceId = get(invoiceIdAtom);
    if (!invoiceId) return null;

    try {
      const [invoice, lineItems] = await Promise.all([
        invoke<any>("get_invoice", { invoiceId }),
        invoke<any[]>("get_invoice_line_items", { invoiceId })
      ]);

      if (!invoice) return null;

      return {
        ...invoice,
        date: dayjs(invoice.date),
        dueDate: invoice.dueDate ? dayjs(invoice.dueDate) : null,
        // Convert cents to currency units for display
        total: centsToUnits(invoice.total),
        taxTotal: centsToUnits(invoice.taxTotal),
        subTotal: centsToUnits(invoice.subTotal),
        lineItems: (lineItems || []).map((item: any) => ({
          ...item,
          unitPrice: centsToUnits(item.unitPrice),
          total: centsToUnits(item.quantity * item.unitPrice)
        })),
      };
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
      return null;
    }
  },
  async (get, set, newValues: any) => {
    const invoiceId = get(invoiceIdAtom);

    const invoice = omit(newValues, "lineItems");
    const lineItems = newValues.lineItems || [];

    try {
      if (!invoiceId) {
        // Insert
        const invoiceData = {
          ...invoice,
          id: nanoid(),
          organizationId: get(organizationIdAtom),
          // Convert dayjs objects to unix timestamps
          date: invoice.date?.valueOf ? invoice.date.valueOf() : invoice.date,
          dueDate: invoice.dueDate?.valueOf ? invoice.dueDate.valueOf() : invoice.dueDate,
          // Convert currency units to cents for storage
          total: unitsToCents(invoice.total),
          taxTotal: unitsToCents(invoice.taxTotal),
          subTotal: unitsToCents(invoice.subTotal),
          lineItems: lineItems.map((item: any) => ({
            ...omit(item, ["id", "total"]),
            unitPrice: unitsToCents(item.unitPrice)
          }))
        };

        const createdInvoice = await invoke<any>("create_invoice", { 
          invoice: invoiceData 
        });
        
        set(invoiceIdAtom, createdInvoice.id);
        message.success(t`Invoice created`);
        
        // Update the invoices list
        const invoices: any = get(invoicesAtom);
        set(invoicesAtom, [createdInvoice, ...invoices]);
      } else {
        // Update
        const updateData = {
          ...invoice,
          // Convert dayjs objects to unix timestamps
          date: invoice.date?.valueOf ? invoice.date.valueOf() : invoice.date,
          dueDate: invoice.dueDate?.valueOf ? invoice.dueDate.valueOf() : invoice.dueDate,
          // Convert currency units to cents for storage
          total: invoice.total ? unitsToCents(invoice.total) : undefined,
          taxTotal: invoice.taxTotal ? unitsToCents(invoice.taxTotal) : undefined,
          subTotal: invoice.subTotal ? unitsToCents(invoice.subTotal) : undefined,
          lineItems: lineItems ? lineItems.map((item: any) => ({
            ...omit(item, ["id", "total"]),
            unitPrice: unitsToCents(item.unitPrice)
          })) : undefined
        };

        const updatedInvoice = await invoke<any>("update_invoice", { 
          invoiceId,
          updates: updateData 
        });
        
        message.success(t`Invoice updated successfully`);
        
        // Update the invoices list
        const invoices: any = get(invoicesAtom);
        const mergedInvoices: any = keyBy([...invoices, updatedInvoice], "id");
        set(invoicesAtom, orderBy(map(mergedInvoices), "date", "desc"));
      }
    } catch (error) {
      console.error("Invoice operation failed:", error);
      if (!invoiceId) {
        message.error(t`Invoice creation failed`);
      } else {
        message.error(t`Invoice update failed`);
      }
    }
  }
);

// Delete invoice
export const deleteInvoiceAtom = atom(null, async (get, set, invoiceId: string) => {
  try {
    const success = await invoke<boolean>("delete_invoice", { invoiceId });
    
    if (success) {
      // Remove invoice from the list
      const invoices: any = reject(get(invoicesAtom), (obj: any) => isEqual(obj.id, invoiceId));
      set(invoicesAtom, invoices);
      message.success(t`Invoice deleted`);
    } else {
      message.error(t`Invoice deletion failed`);
    }
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    message.error(t`Invoice deletion failed`);
  }
});

// Organizations
export const organizationsAtom = atom([]);
export const setOrganizationsAtom = atom(null, async (_get, set) => {
  const response: any = await sqlite.select(`
    SELECT
      *
    FROM
      organizations
    ORDER BY
      name ASC
  `);
  set(organizationsAtom, response);
});
// Organization
export const organizationIdAtom = atomWithStorage<string | null>("organizationId", null);
export const organizationAtom = atom(
  async (get) => {
    const organizationId = get(organizationIdAtom);
    const organizations: any = get(organizationsAtom);
    return find(organizations, ["id", organizationId]);
  },
  async (get, set, newValues: any) => {
    const organizationId = get(organizationIdAtom);

    if (!organizationId) {
      // Insert
      newValues.id = nanoid();
      const response = await sqlite.execute(
        `INSERT INTO organizations (${keys(newValues).join(", ")}) VALUES (${map(
          values(newValues),
          (_key, index) => `$${index + 1}`
        ).join(", ")})`,
        values(newValues)
      );
      set(setOrganizationsAtom);
      set(organizationIdAtom, newValues.id);
      if (response["rowsAffected"] == 1) {
        message.success(t`Organization created`);
      } else {
        message.error(t`Organization creation failed`);
      }
    } else {
      // Update
      const setValues = map(keys(newValues), (key, index) => `${key} = $${index + 1}`).join(", ");
      const response = await sqlite.execute(
        `UPDATE organizations SET ${setValues} WHERE id = $${values(newValues).length + 1}`,
        [...values(newValues), organizationId]
      );
      if (response["rowsAffected"] == 1) {
        message.success(t`Organization updated successfully`);
      } else {
        message.error(t`Organization updated failed`);
      }
      set(setOrganizationsAtom);
      set(organizationIdAtom, organizationId);
    }
  }
);
// Delete organization
export const deleteOrganizationAtom = atom(null, async (get, set) => {
  const organizationId = get(organizationIdAtom);
  await sqlite.execute("DELETE FROM organizations WHERE id = $1", [organizationId]);

  // TODO: needs some validation that DELETE was successful
  const organizations: any = reject(get(organizationsAtom), (obj: any) => isEqual(obj.id, organizationId));
  set(organizationsAtom, organizations);

  const nextOrganization: any = first(organizations);
  set(organizationIdAtom, organizations.length > 0 ? nextOrganization.id : null);
  message.success(t`Organization deleted`);
});

// Tax rates
export const taxRatesAtom = atom([]);
export const setTaxRatesAtom = atom(null, async (get, set) => {
  const organizationId = get(organizationIdAtom);
  const response: any = await sqlite.select(
    `
    SELECT
      *
    FROM
      taxRates
    WHERE
      organizationId = $1
    ORDER BY
      name ASC
    `,
    [organizationId]
  );
  set(taxRatesAtom, response);
});
// Tax rate
export const taxRateIdAtom = atom<string | null>(null);
export const taxRateAtom = atom(
  async (get) => {
    const taxRateId = get(taxRateIdAtom);
    if (!taxRateId) return null;

    const response: any = await sqlite.select(
      `
      SELECT
        *
      FROM
        taxRates
      WHERE
        id = $1
      LIMIT 1
    `,
      [taxRateId]
    );
    const taxRate: any = first(response);
    return taxRate;
  },
  async (get, _set, newValues: any) => {
    const taxRateId = get(taxRateIdAtom);

    if (!taxRateId) {
      // Insert
      newValues.id = nanoid();
      newValues.organizationId = get(organizationIdAtom);
      const response = await sqlite.execute(
        `INSERT INTO taxRates (${keys(newValues).join(", ")}) VALUES (${map(
          values(newValues),
          (_key, index) => `$${index + 1}`
        ).join(", ")})`,
        values(newValues)
      );
      if (response["rowsAffected"] == 1) {
        message.success(t`Client created`);
      } else {
        message.error(t`Client creation failed`);
      }
    } else {
      // Update
      const setValues = map(keys(newValues), (key, index) => `${key} = $${index + 1}`).join(", ");
      const response = await sqlite.execute(
        `UPDATE taxRates SET ${setValues} WHERE id = $${values(newValues).length + 1}`,
        [...values(newValues), taxRateId]
      );
      if (response["rowsAffected"] == 1) {
        message.success(t`Client updated successfully`);
      } else {
        message.error(t`Client updated failed`);
      }
    }
  }
);
