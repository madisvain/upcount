import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { message } from "antd";
import { nanoid } from "nanoid";
import { t } from "@lingui/core/macro";
import isEqual from "lodash/isEqual";
import reject from "lodash/reject";
import first from "lodash/first";
import { invoke } from "@tauri-apps/api/core";

import { generateInvoiceNumber } from "src/utils/invoice";

// Organizations
export const organizationsAtom = atom<any[]>([]);
export const setOrganizationsAtom = atom(null, async (_get, set) => {
  try {
    const response = await invoke<any[]>("get_organizations");
    set(organizationsAtom, response);
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    message.error(t`Failed to fetch organizations`);
    set(organizationsAtom, []);
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