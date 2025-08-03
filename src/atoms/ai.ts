import { atomWithStorage } from "jotai/utils";

// Store Anthropic API key in local storage for security
export const anthropicApiKeyAtom = atomWithStorage<string | null>(
  "anthropicApiKey", 
  null,
  undefined,
  { getOnInit: true }
);
anthropicApiKeyAtom.debugLabel = "anthropicApiKeyAtom";