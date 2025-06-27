import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { message } from "antd";
import { nanoid } from "nanoid";
import { t } from "@lingui/core/macro";
import dayjs from "dayjs";
import isEqual from "lodash/isEqual";
import first from "lodash/first";
import map from "lodash/map";
import omit from "lodash/omit";
import orderBy from "lodash/orderBy";
import keyBy from "lodash/keyBy";
import reject from "lodash/reject";
import { invoke } from "@tauri-apps/api/core";

import { defaultLocale } from "src/utils/lingui";
import { centsToUnits, unitsToCents } from "src/utils/currency";

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
        emails: client?.emails ? JSON.parse(client.emails) : [],
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
        emails: Array.isArray(newValues.emails) ? JSON.stringify(newValues.emails) : newValues.emails,
      };

      if (!clientId) {
        // Insert
        processedValues.id = nanoid();
        processedValues.organizationId = get(organizationIdAtom);
        const createdClient = await invoke<any>("create_client", {
          client: processedValues,
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
          updates: processedValues,
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
    const invoicesWithUnits = response.map((invoice) => ({
      ...invoice,
      total: centsToUnits(invoice.total),
      taxTotal: centsToUnits(invoice.taxTotal),
      subTotal: centsToUnits(invoice.subTotal),
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
        invoke<any[]>("get_invoice_line_items", { invoiceId }),
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
          total: centsToUnits(item.quantity * item.unitPrice),
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
          state: invoice.state || "draft", // Default to draft if not specified
          // Convert dayjs objects to unix timestamps
          date: invoice.date?.valueOf ? invoice.date.valueOf() : invoice.date,
          dueDate: invoice.dueDate?.valueOf ? invoice.dueDate.valueOf() : invoice.dueDate,
          // Convert currency units to cents for storage
          total: unitsToCents(invoice.total),
          taxTotal: unitsToCents(invoice.taxTotal),
          subTotal: unitsToCents(invoice.subTotal),
          lineItems: lineItems.map((item: any) => ({
            ...omit(item, ["id", "total"]),
            unitPrice: unitsToCents(item.unitPrice),
          })),
        };

        const createdInvoice = await invoke<any>("create_invoice", {
          invoice: invoiceData,
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
          lineItems: lineItems
            ? lineItems.map((item: any) => ({
                ...omit(item, ["id", "total"]),
                unitPrice: unitsToCents(item.unitPrice),
              }))
            : undefined,
        };

        const updatedInvoice = await invoke<any>("update_invoice", {
          invoiceId,
          updates: updateData,
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
export const organizationsAtom = atom<any[]>([]);
export const setOrganizationsAtom = atom(null, async (_get, set) => {
  try {
    const response = await invoke<any[]>("get_organizations");
    set(organizationsAtom, response);
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    message.error(t`Failed to fetch organizations`);
  }
});
// Organization
export const organizationIdAtom = atomWithStorage<string | null>("organizationId", null);
export const organizationAtom = atom(
  async (get) => {
    const organizationId = get(organizationIdAtom);
    if (!organizationId) return null;

    try {
      const organization = await invoke<any>("get_organization", { organizationId });

      // Convert logo byte array to data URL string if present
      if (organization?.logo && Array.isArray(organization.logo)) {
        // The byte array contains UTF-8 bytes of the original data URL string
        const bytes = new Uint8Array(organization.logo);
        const decoder = new TextDecoder("utf-8");
        organization.logo = decoder.decode(bytes);
      }

      return organization;
    } catch (error) {
      console.error("Failed to fetch organization:", error);
      return null;
    }
  },
  async (get, set, newValues: any) => {
    const organizationId = get(organizationIdAtom);

    try {
      if (!organizationId) {
        // Insert
        const organizationData = {
          ...newValues,
          id: nanoid(),
        };

        const createdOrganization = await invoke<any>("create_organization", {
          organization: organizationData,
        });
        set(setOrganizationsAtom);
        set(organizationIdAtom, createdOrganization.id);
        message.success(t`Organization created`);
      } else {
        // Update
        await invoke<any>("update_organization", {
          organizationId,
          updates: newValues,
        });
        message.success(t`Organization updated successfully`);
        set(setOrganizationsAtom);
        set(organizationIdAtom, organizationId);
      }
    } catch (error) {
      console.error("Organization operation failed:", error);
      if (!organizationId) {
        message.error(t`Organization creation failed`);
      } else {
        message.error(t`Organization update failed`);
      }
    }
  }
);
// Get next invoice number
export const nextInvoiceNumberAtom = atom(
  async (get) => {
    const organizationId = get(organizationIdAtom);
    if (!organizationId) return null;

    try {
      const nextNumber = await invoke<string>("get_next_invoice_number", { organizationId });
      return nextNumber;
    } catch (error) {
      console.error("Failed to get next invoice number:", error);
      return null;
    }
  }
);

// Delete organization
export const deleteOrganizationAtom = atom(null, async (get, set) => {
  const organizationId = get(organizationIdAtom);

  try {
    const success = await invoke<boolean>("delete_organization", { organizationId });

    if (success) {
      // Remove organization from the list
      const organizations: any = reject(get(organizationsAtom), (obj: any) => isEqual(obj.id, organizationId));
      set(organizationsAtom, organizations);

      const nextOrganization: any = first(organizations);
      set(organizationIdAtom, organizations.length > 0 ? nextOrganization.id : null);
      message.success(t`Organization deleted`);
    } else {
      message.error(t`Organization deletion failed`);
    }
  } catch (error) {
    console.error("Failed to delete organization:", error);
    message.error(t`Organization deletion failed`);
  }
});

// Tax rates
export const taxRatesAtom = atom<any[]>([]);
export const setTaxRatesAtom = atom(null, async (get, set) => {
  const organizationId = get(organizationIdAtom);
  try {
    const response = await invoke<any[]>("get_tax_rates", { organizationId });
    set(taxRatesAtom, response);
  } catch (error) {
    console.error("Failed to fetch tax rates:", error);
    message.error(t`Failed to fetch tax rates`);
  }
});
// Tax rate
export const taxRateIdAtom = atom<string | null>(null);
export const taxRateAtom = atom(
  async (get) => {
    const taxRateId = get(taxRateIdAtom);
    if (!taxRateId) return null;

    try {
      const taxRate = await invoke<any>("get_tax_rate", { taxRateId });
      return taxRate;
    } catch (error) {
      console.error("Failed to fetch tax rate:", error);
      return null;
    }
  },
  async (get, set, newValues: any) => {
    const taxRateId = get(taxRateIdAtom);

    try {
      if (!taxRateId) {
        // Insert
        const taxRateData = {
          ...newValues,
          id: nanoid(),
          organizationId: get(organizationIdAtom),
          // Convert boolean to integer for isDefault
          isDefault: typeof newValues.isDefault === "boolean" ? (newValues.isDefault ? 1 : 0) : newValues.isDefault,
        };

        const createdTaxRate = await invoke<any>("create_tax_rate", {
          taxRate: taxRateData,
        });
        set(taxRateIdAtom, createdTaxRate.id);
        message.success(t`Tax rate created`);

        // Update the tax rates list
        const taxRates: any = get(taxRatesAtom);
        set(taxRatesAtom, orderBy([...taxRates, createdTaxRate], "name", "asc"));
      } else {
        // Update
        const updateData = {
          ...newValues,
          // Convert boolean to integer for isDefault
          isDefault: typeof newValues.isDefault === "boolean" ? (newValues.isDefault ? 1 : 0) : newValues.isDefault,
        };

        const updatedTaxRate = await invoke<any>("update_tax_rate", {
          taxRateId,
          updates: updateData,
        });
        message.success(t`Tax rate updated successfully`);

        // Update the tax rates list
        const taxRates: any = get(taxRatesAtom);
        const mergedTaxRates: any = keyBy([...taxRates, updatedTaxRate], "id");
        set(taxRatesAtom, orderBy(map(mergedTaxRates), "name", "asc"));
      }
    } catch (error) {
      console.error("Tax rate operation failed:", error);
      if (!taxRateId) {
        message.error(t`Tax rate creation failed`);
      } else {
        message.error(t`Tax rate update failed`);
      }
    }
  }
);
