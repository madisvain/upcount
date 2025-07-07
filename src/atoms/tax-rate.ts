import { atom } from "jotai";
import { message } from "antd";
import { nanoid } from "nanoid";
import { t } from "@lingui/core/macro";
import orderBy from "lodash/orderBy";
import keyBy from "lodash/keyBy";
import map from "lodash/map";
import { invoke } from "@tauri-apps/api/core";

import { organizationIdAtom } from "./organization";

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
    set(taxRatesAtom, []);
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