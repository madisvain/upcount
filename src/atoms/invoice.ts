import { atom } from "jotai";
import { message } from "antd";
import { nanoid } from "nanoid";
import { t } from "@lingui/core/macro";
import dayjs from "dayjs";
import isEqual from "lodash/isEqual";
import omit from "lodash/omit";
import orderBy from "lodash/orderBy";
import keyBy from "lodash/keyBy";
import map from "lodash/map";
import reject from "lodash/reject";
import { invoke } from "@tauri-apps/api/core";

import { centsToUnits, unitsToCents, multiplyDecimal } from "src/utils/currency";
import { organizationIdAtom, nextInvoiceNumberAtom } from "./organization";

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
    set(invoicesAtom, []);
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
          total: centsToUnits(multiplyDecimal(item.quantity, item.unitPrice)),
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

        // Force refresh organization data to get updated invoice counter
        const currentOrgId = get(organizationIdAtom);
        if (currentOrgId) {
          set(organizationIdAtom, null);
          set(organizationIdAtom, currentOrgId);
        }
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

    // Force refresh organization data to get updated invoice counter
    const currentOrgId = get(organizationIdAtom);
    if (currentOrgId) {
      set(organizationIdAtom, null);
      set(organizationIdAtom, currentOrgId);
    }

    return createdInvoice.id;
  } catch (error) {
    console.error("Failed to duplicate invoice:", error);
    message.error(t`Invoice duplication failed`);
    return null;
  }
});