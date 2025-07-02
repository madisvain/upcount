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
import { generateInvoiceNumber } from "src/utils/invoice";

// Generic
export const siderAtom = atomWithStorage("sider", false);
siderAtom.debugLabel = "siderAtom";

export const localeAtom = atomWithStorage("locale", defaultLocale);
localeAtom.debugLabel = "localeAtom";

// Clients
export const clientsAtom = atom<any[]>([]);
clientsAtom.debugLabel = "clientsAtom";

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
setClientsAtom.debugLabel = "setClientsAtom";

// Client
export const clientIdAtom = atom<string | null>(null);
clientIdAtom.debugLabel = "clientIdAtom";

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

// Duplicate invoice
export const duplicateInvoiceAtom = atom(null, async (get, set, invoiceId: string) => {
  try {
    // Fetch the original invoice with line items
    const [originalInvoice, lineItems] = await Promise.all([
      invoke<any>("get_invoice", { invoiceId }),
      invoke<any[]>("get_invoice_line_items", { invoiceId }),
    ]);

    if (!originalInvoice) {
      message.error(t`Invoice not found`);
      return null;
    }

    // Generate new invoice number
    const nextNumber = await get(nextInvoiceNumberAtom);
    if (!nextNumber) {
      message.error(t`Failed to generate invoice number`);
      return null;
    }

    // Create new invoice data with duplicated information
    const newInvoiceId = nanoid();
    const currentDate = dayjs();
    const duplicatedInvoice = {
      id: newInvoiceId,
      organizationId: get(organizationIdAtom),
      number: nextNumber,
      state: "draft", // Always start as draft
      clientId: originalInvoice.clientId,
      date: currentDate.valueOf(),
      dueDate: originalInvoice.dueDate ? currentDate.add(dayjs(originalInvoice.dueDate).diff(dayjs(originalInvoice.date), 'day'), 'day').valueOf() : null,
      currency: originalInvoice.currency,
      total: originalInvoice.total,
      taxTotal: originalInvoice.taxTotal,
      subTotal: originalInvoice.subTotal,
      customerNotes: originalInvoice.customerNotes,
      lineItems: (lineItems || []).map((item: any) => ({
        ...omit(item, ["id", "invoiceId", "createdAt"]),
      })),
    };

    // Create the duplicated invoice
    const createdInvoice = await invoke<any>("create_invoice", {
      invoice: duplicatedInvoice,
    });

    message.success(t`Invoice duplicated successfully`);

    // Update the invoices list
    const invoices: any = get(invoicesAtom);
    const invoiceWithUnits = {
      ...createdInvoice,
      total: centsToUnits(createdInvoice.total),
      taxTotal: centsToUnits(createdInvoice.taxTotal),
      subTotal: centsToUnits(createdInvoice.subTotal),
    };
    set(invoicesAtom, [invoiceWithUnits, ...invoices]);

    return createdInvoice.id;
  } catch (error) {
    console.error("Failed to duplicate invoice:", error);
    message.error(t`Invoice duplication failed`);
    return null;
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
export const organizationIdAtom = atomWithStorage<string | null>("organizationId", null, undefined, { getOnInit: true });
organizationIdAtom.debugLabel = "organizationIdAtom";

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
        
        // Force refresh by temporarily clearing and resetting the organizationId
        // This will trigger the organizationAtom getter to refetch
        set(organizationIdAtom, null);
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
organizationAtom.debugLabel = "organizationAtom";

// Get next invoice number
export const nextInvoiceNumberAtom = atom(async (get) => {
  const organization = await get(organizationAtom);
  if (!organization) return null;

  const format = organization.invoiceNumberFormat;
  const counter = (organization.invoiceNumberCounter || 0) + 1;

  return generateInvoiceNumber(format, counter);
});

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

// Time Tracking Atoms

// Tags
export const tagsAtom = atom<any[]>([]);
export const setTagsAtom = atom(null, async (get, set) => {
  const organizationId = get(organizationIdAtom);
  try {
    const response = await invoke<any[]>("get_tags", { organizationId });
    set(tagsAtom, response);
  } catch (error) {
    console.error("Failed to fetch tags:", error);
    message.error(t`Failed to fetch tags`);
  }
});

// Tag
export const tagIdAtom = atom<string | null>(null);
export const tagAtom = atom(
  async (get) => {
    const tagId = get(tagIdAtom);
    if (!tagId) return null;

    try {
      const tag = await invoke<any>("get_tag", { tagId });
      return tag;
    } catch (error) {
      console.error("Failed to fetch tag:", error);
      return null;
    }
  },
  async (get, set, newValues: any) => {
    const tagId = get(tagIdAtom);

    try {
      if (!tagId) {
        // Insert
        const tagData = {
          ...newValues,
          id: nanoid(),
          organizationId: get(organizationIdAtom),
        };

        const createdTag = await invoke<any>("create_tag", {
          tag: tagData,
        });
        set(tagIdAtom, createdTag.id);
        message.success(t`Tag created`);

        // Update the tags list
        const tags: any = get(tagsAtom);
        set(tagsAtom, orderBy([...tags, createdTag], "name", "asc"));
      } else {
        // Update
        const updatedTag = await invoke<any>("update_tag", {
          tagId,
          updates: newValues,
        });
        message.success(t`Tag updated successfully`);

        // Update the tags list
        const tags: any = get(tagsAtom);
        const mergedTags: any = keyBy([...tags, updatedTag], "id");
        set(tagsAtom, orderBy(map(mergedTags), "name", "asc"));
      }
    } catch (error) {
      console.error("Tag operation failed:", error);
      if (!tagId) {
        message.error(t`Tag creation failed`);
      } else {
        message.error(t`Tag update failed`);
      }
    }
  }
);

// Delete tag
export const deleteTagAtom = atom(null, async (get, set, tagId: string) => {
  try {
    const success = await invoke<boolean>("delete_tag", { tagId });

    if (success) {
      // Remove tag from the list
      const tags: any = reject(get(tagsAtom), (obj: any) => isEqual(obj.id, tagId));
      set(tagsAtom, tags);
      message.success(t`Tag deleted`);
    } else {
      message.error(t`Tag deletion failed`);
    }
  } catch (error) {
    console.error("Failed to delete tag:", error);
    message.error(t`Tag deletion failed`);
  }
});

// Time Entries
export const timeEntriesAtom = atom<any[]>([]);
export const setTimeEntriesAtom = atom(null, async (get, set) => {
  const organizationId = get(organizationIdAtom);
  try {
    const response = await invoke<any[]>("get_time_entries", { organizationId });
    set(timeEntriesAtom, response);
  } catch (error) {
    console.error("Failed to fetch time entries:", error);
    message.error(t`Failed to fetch time entries`);
  }
});

// Update time entry locally without refetching
export const updateTimeEntryLocallyAtom = atom(null, (get, set, { id, updates }: { id: string, updates: any }) => {
  const entries = get(timeEntriesAtom);
  const updatedEntries = entries.map(entry => 
    entry.id === id ? { ...entry, ...updates } : entry
  );
  set(timeEntriesAtom, updatedEntries);
});

// Direct update time entry without triggering fetches
export const updateTimeEntryDirectlyAtom = atom(null, async (get, set, { id, updates }: { id: string, updates: any }) => {
  const entry = get(timeEntriesAtom).find(e => e.id === id);
  
  if (!entry) return;
  
  try {
    // Merge updates with existing entry
    const updatedEntry = { ...entry, ...updates };
    
    // Prepare the update data for database
    const updateData = {
      ...updatedEntry,
      // Convert dayjs back to timestamps if needed
      startTime: updatedEntry.startTime instanceof dayjs ? updatedEntry.startTime.valueOf() : updatedEntry.startTime,
      endTime: updatedEntry.endTime instanceof dayjs ? updatedEntry.endTime.valueOf() : updatedEntry.endTime,
      tags: Array.isArray(updatedEntry.tags) ? JSON.stringify(updatedEntry.tags) : updatedEntry.tags,
    };
    
    // Update in database
    await invoke("update_time_entry", { timeEntryId: id, updates: updateData });
    
    // Update local state immediately
    set(updateTimeEntryLocallyAtom, { id, updates });
    
  } catch (error) {
    console.error("Failed to update time entry:", error);
    message.error(t`Failed to update time entry`);
  }
});

// Time Entry
export const timeEntryIdAtom = atom<string | null>(null);
export const timeEntryAtom = atom(
  async (get) => {
    const timeEntryId = get(timeEntryIdAtom);
    if (!timeEntryId) return null;

    try {
      const timeEntry = await invoke<any>("get_time_entry", { timeEntryId });
      if (!timeEntry) return null;

      return {
        ...timeEntry,
        startTime: timeEntry.startTime ? dayjs(timeEntry.startTime) : null,
        endTime: timeEntry.endTime ? dayjs(timeEntry.endTime) : null,
        tags: timeEntry.tags ? JSON.parse(timeEntry.tags) : [],
      };
    } catch (error) {
      console.error("Failed to fetch time entry:", error);
      return null;
    }
  },
  async (get, set, newValues: any) => {
    const timeEntryId = get(timeEntryIdAtom);

    try {
      if (!timeEntryId) {
        // Insert
        const timeEntryData = {
          ...newValues,
          id: nanoid(),
          organizationId: get(organizationIdAtom),
          // Convert dayjs objects to unix timestamps
          startTime: newValues.startTime?.valueOf ? newValues.startTime.valueOf() : newValues.startTime,
          endTime: newValues.endTime?.valueOf ? newValues.endTime.valueOf() : newValues.endTime,
          // Convert tags array to JSON string
          tags: Array.isArray(newValues.tags) ? JSON.stringify(newValues.tags) : newValues.tags,
          // Convert boolean to integer
          isBillable: typeof newValues.isBillable === "boolean" ? (newValues.isBillable ? 1 : 0) : newValues.isBillable,
        };

        const createdTimeEntry = await invoke<any>("create_time_entry", {
          timeEntry: timeEntryData,
        });
        set(timeEntryIdAtom, createdTimeEntry.id);
        message.success(t`Time entry created`);

        // Update the time entries list
        const timeEntries: any = get(timeEntriesAtom);
        set(timeEntriesAtom, [createdTimeEntry, ...timeEntries]);
        
        return createdTimeEntry;
      } else {
        // Update
        const updateData = {
          ...newValues,
          // Convert dayjs objects to unix timestamps
          startTime: newValues.startTime?.valueOf ? newValues.startTime.valueOf() : newValues.startTime,
          endTime: newValues.endTime?.valueOf ? newValues.endTime.valueOf() : newValues.endTime,
          // Convert tags array to JSON string
          tags: Array.isArray(newValues.tags) ? JSON.stringify(newValues.tags) : newValues.tags,
          // Convert boolean to integer
          isBillable: typeof newValues.isBillable === "boolean" ? (newValues.isBillable ? 1 : 0) : newValues.isBillable,
        };

        const updatedTimeEntry = await invoke<any>("update_time_entry", {
          timeEntryId,
          updates: updateData,
        });
        message.success(t`Time entry updated successfully`);

        // Update the time entries list
        const timeEntries: any = get(timeEntriesAtom);
        const mergedTimeEntries: any = keyBy([...timeEntries, updatedTimeEntry], "id");
        set(timeEntriesAtom, orderBy(map(mergedTimeEntries), "startTime", "desc"));
        
        return updatedTimeEntry;
      }
    } catch (error) {
      console.error("Time entry operation failed:", error);
      if (!timeEntryId) {
        message.error(t`Time entry creation failed`);
      } else {
        message.error(t`Time entry update failed`);
      }
    }
  }
);

// Delete time entry
export const deleteTimeEntryAtom = atom(null, async (get, set, timeEntryId: string) => {
  try {
    const success = await invoke<boolean>("delete_time_entry", { timeEntryId });

    if (success) {
      // Remove time entry from the list
      const timeEntries: any = reject(get(timeEntriesAtom), (obj: any) => isEqual(obj.id, timeEntryId));
      set(timeEntriesAtom, timeEntries);
      message.success(t`Time entry deleted`);
    } else {
      message.error(t`Time entry deletion failed`);
    }
  } catch (error) {
    console.error("Failed to delete time entry:", error);
    message.error(t`Time entry deletion failed`);
  }
});

// Running timer atom for tracking active timer (persisted in localStorage)
export const runningTimerAtom = atomWithStorage<string | null>("runningTimer", null);
