import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { message } from "antd";
import { nanoid } from "nanoid";
import { t } from "@lingui/macro";
import dayjs from "dayjs";
import isEqual from "lodash/isEqual";
import find from "lodash/find";
import first from "lodash/first";
import forEach from "lodash/forEach";
import map from "lodash/map";
import omit from "lodash/omit";
import orderBy from "lodash/orderBy";
import keys from "lodash/keys";
import keyBy from "lodash/keyBy";
import values from "lodash/values";
import reject from "lodash/reject";
import Database from "tauri-plugin-sql-api";

import { defaultLocale } from "src/utils/lingui";

const sqlite = await Database.load("sqlite:sqlite.db");

// Generic
export const siderAtom = atomWithStorage("sider", false);
export const localeAtom = atomWithStorage("locale", defaultLocale);

// Clients
export const clientsAtom = atom([]);
export const setClientsAtom = atom(null, async (get, set) => {
  const organizationId = get(organizationIdAtom);
  const response: any = await sqlite.select(
    `
    SELECT
      *
    FROM
      clients
    WHERE
      organizationId = $1
    ORDER BY
      name ASC
  `,
    [organizationId]
  );
  set(clientsAtom, response);
});

// Client
export const clientIdAtom = atom<string | null>(null);
export const clientAtom = atom(
  async (get) => {
    const clientId = get(clientIdAtom);
    if (!clientId) return null;

    const response: any = await sqlite.select(
      `
      SELECT
        *
      FROM
        clients
      WHERE id = $1
        LIMIT 1
    `,
      [clientId]
    );
    const client: any = first(response);
    return { ...client, emails: client?.emails ? JSON.parse(client.emails) : [] };
  },
  async (get, set, newValues: any) => {
    const clientId = get(clientIdAtom);

    if (!clientId) {
      // Insert
      newValues.id = nanoid();
      newValues.organizationId = get(organizationIdAtom);
      const response = await sqlite.execute(
        `INSERT INTO clients (${keys(newValues).join(", ")}) VALUES (${map(
          values(newValues),
          (_key, index) => `$${index + 1}`
        ).join(", ")})`,
        values(newValues)
      );
      if (response["rowsAffected"] == 1) {
        set(clientIdAtom, newValues.id);
        message.success(t`Client created`);
      } else {
        message.error(t`Client creation failed`);
      }
    } else {
      // Update
      const setValues = map(keys(newValues), (key, index) => `${key} = $${index + 1}`).join(", ");
      const response = await sqlite.execute(
        `UPDATE clients SET ${setValues} WHERE id = $${values(newValues).length + 1}`,
        [...values(newValues), clientId]
      );
      if (response["rowsAffected"] == 1) {
        message.success(t`Client updated successfully`);
      } else {
        message.error(t`Client updated failed`);
      }
    }

    // Update invoice in list
    const returning: any = await sqlite.select("SELECT * FROM clients WHERE id = $1 LIMIT 1", [get(clientIdAtom)]);

    const clients: any = get(clientsAtom);
    const mergedClients: any = keyBy([...clients, ...returning], "id");
    set(clientsAtom, orderBy(map(mergedClients), "name", "asc"));
  }
);

// Invoices
export const invoicesAtom = atom([]);
export const setInvoicesAtom = atom(null, async (get, set) => {
  const organizationId = get(organizationIdAtom);
  const response: any = await sqlite.select(
    `
    SELECT
      invoices.*,
      clients.name AS clientName
    FROM
      invoices
    INNER JOIN
      clients ON invoices.clientId = clients.id
    WHERE
      invoices.organizationId = $1
    ORDER BY
      invoices.date DESC
    `,
    [organizationId]
  );
  set(invoicesAtom, response);
});

// Invoice
export const invoiceIdAtom = atom<string | null>(null);
export const invoiceAtom = atom(
  async (get) => {
    const invoiceId = get(invoiceIdAtom);
    if (!invoiceId) return null;

    const response: any = await sqlite.select(
      `
      SELECT
        invoice.*,
        (
          SELECT
            json_array(json_object(
              'id', li.id,
              'description', li.description,
              'quantity', li.quantity,
              'unitPrice', li.unitPrice,
              'taxRate', li.taxRate,
              'total', li.unitPrice * li.quantity
            ))
          FROM
            invoiceLineItems li
          WHERE
            li.invoiceId = invoice.id
        ) AS lineItems
      FROM
        invoices invoice
      WHERE
        invoice.id = $1
      LIMIT 1
    `,
      [invoiceId]
    );
    const invoice: any = first(response);
    return {
      ...invoice,
      date: dayjs(invoice.date),
      dueDate: dayjs(invoice.dueDate),
      lineItems: JSON.parse(invoice.lineItems),
    };
  },
  async (get, set, newValues: any) => {
    const invoiceId = get(invoiceIdAtom);

    const invoice = omit(newValues, "lineItems");
    const lineItems = newValues.lineItems;

    if (!invoiceId) {
      // Insert
      invoice.id = nanoid();
      invoice.organizationId = get(organizationIdAtom);

      const response = await sqlite.execute(
        `
        BEGIN TRANSACTION;

        INSERT INTO
          invoices (${keys(invoice).join(", ")})
        VALUES
          (${map(values(invoice), (_key, index) => `$${index + 1}`).join(", ")});
        
        COMMIT;
        `,
        values(invoice)
      );

      forEach(lineItems, async (lineItem: any) => {
        const lineItemValues = { ...omit(lineItem, "total"), id: nanoid(), invoiceId: invoice.id };
        await sqlite.execute(
          `
          INSERT INTO
            invoiceLineItems (${keys(lineItemValues).join(", ")})
          VALUES
            (${map(values(lineItemValues), (_key, index) => `$${index + 1}`).join(", ")});
          `,
          values(lineItemValues)
        );
      });

      if (response["rowsAffected"] >= 1) {
        set(invoiceIdAtom, invoice.id);
        message.success(t`Invoice created`);
      } else {
        message.error(t`Invoice creation failed`);
      }
    } else {
      // Update
      // TODO: needs transaction support
      // await sqlite.execute("BEGIN TRANSACTION;"); <-- This does not seem supported
      const response = await sqlite.execute(
        `
        UPDATE
          invoices
        SET
          ${map(keys(invoice), (key, index) => `${key} = $${index + 1}`).join(", ")}
        WHERE
          id = $${values(invoice).length + 1};
        `,
        [...values(invoice), invoiceId]
      );

      if (lineItems) {
        await sqlite.execute(
          `
          DELETE FROM
            invoiceLineItems
          WHERE invoiceId = $1
          `,
          [invoiceId]
        );

        forEach(lineItems, async (lineItem: any) => {
          const lineItemValues = { ...omit(lineItem, "total"), id: nanoid(), invoiceId };
          await sqlite.execute(
            `
            INSERT INTO
              invoiceLineItems (${keys(lineItemValues).join(", ")})
            VALUES
              (${map(values(lineItemValues), (_key, index) => `$${index + 1}`).join(", ")});
            `,
            values(lineItemValues)
          );
        });
      }

      if (response["rowsAffected"] >= 1) {
        message.success(t`Invoice updated successfully`);
      } else {
        message.error(t`Invoice updated failed`);
      }
    }

    // Update invoice in list
    const returning: any = await sqlite.select(
      `
      SELECT
        invoices.*,
        clients.name AS clientName
      FROM
        invoices
      INNER JOIN
        clients ON invoices.clientId = clients.id
      WHERE
        invoices.id = $1
      LIMIT 1
    `,
      [get(invoiceIdAtom)]
    );

    const invoices: any = get(invoicesAtom);
    const mergedInvoices: any = keyBy([...invoices, ...returning], "id");
    set(invoicesAtom, map(mergedInvoices));
  }
);

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
    const organizations: any = await get(organizationsAtom);
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
  await sqlite.select("DELETE FROM organizations WHERE id = $1", [organizationId]);

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
