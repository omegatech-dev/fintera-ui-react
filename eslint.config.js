import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/*.config.js",
      "**/*.config.mjs",
      "**/.DS_Store",
      "auth.js",
      "config.js",
      "src/shared/utils/avatarUtils.js",
      "src/shared/utils/formatStatus.js",
      "src/shared/utils/formatters.js",
      "src/shared/utils/statusUtils.js",
      "src/hooks/useDebounce.js",
    ],
  },
  {
    files: ["**/*.{js,mjs,jsx}"],
    languageOptions: {
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        process: "readonly",
      },
    },
    plugins: {
      js,
    },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
  },
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  reactRefresh.configs.vite,
  {
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }],
      "no-case-declarations": "off",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true, allowCompoundComponents: true }],
    },
  },
]);
