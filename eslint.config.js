import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**", 
      "node_modules/**", 
      "src-tauri/**",
      "**/*.config.js",
      "**/*.config.ts",
      "build/**",
      "public/**"
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parser: tsparser,
      globals: {
        ...globals.browser,
        ...globals.es2020,
        React: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // TypeScript ESLint recommended rules
      ...tseslint.configs.recommended.rules,
      
      // React hooks rules
      ...reactHooks.configs.recommended.rules,
      
      // Custom rules
      "@typescript-eslint/no-explicit-any": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
];