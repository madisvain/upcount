import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { message } from "antd";
import { nanoid } from "nanoid";
import { t } from "@lingui/core/macro";
import dayjs from "dayjs";
import isEqual from "lodash/isEqual";
import orderBy from "lodash/orderBy";
import keyBy from "lodash/keyBy";
import map from "lodash/map";
import reject from "lodash/reject";
import { invoke } from "@tauri-apps/api/core";

import { organizationIdAtom } from "./organization";

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