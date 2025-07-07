import { atom } from "jotai";
import { message } from "antd";
import { nanoid } from "nanoid";
import { t } from "@lingui/core/macro";
import isEqual from "lodash/isEqual";
import orderBy from "lodash/orderBy";
import keyBy from "lodash/keyBy";
import map from "lodash/map";
import reject from "lodash/reject";
import { invoke } from "@tauri-apps/api/core";

import { organizationIdAtom } from "./organization";

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
    set(clientsAtom, []);
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