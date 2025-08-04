import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";

// Store Anthropic API key in local storage for security
export const anthropicApiKeyAtom = atomWithStorage<string | null>(
  "anthropicApiKey", 
  null,
  undefined,
  { getOnInit: true }
);
anthropicApiKeyAtom.debugLabel = "anthropicApiKeyAtom";

// Temporary storage for AI-generated invoice data
export const aiInvoiceDataAtom = atom<any>(null);
aiInvoiceDataAtom.debugLabel = "aiInvoiceDataAtom";