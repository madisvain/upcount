import { atomWithStorage } from "jotai/utils";
import { defaultLocale } from "src/utils/lingui";

// Generic UI state atoms
export const siderAtom = atomWithStorage("sider", false);
siderAtom.debugLabel = "siderAtom";

export const localeAtom = atomWithStorage("locale", defaultLocale);
localeAtom.debugLabel = "localeAtom";