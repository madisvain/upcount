import type { LinguiConfig } from "@lingui/conf";

const config: LinguiConfig = {
  locales: ["en", "en-GB", "de", "et", "fi", "fr", "el", "nl", "pt", "sv", "uk"],
  catalogs: [
    {
      path: "<rootDir>/src/locales/{locale}",
      include: ["src"],
    },
  ],
};

export default config;
