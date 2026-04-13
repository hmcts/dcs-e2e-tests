import { LintingConfig } from "@hmcts/playwright-common";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    rules: {
      // Disallow trailing whitespace at the end of lines
      "no-trailing-spaces": "error",
      // Enforce at least one newline at the end of files
      "eol-last": ["error", "always"],
      // Disallow multiple empty lines
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
      // Require semicolons at the end of statements
      semi: ["error", "always"],
      // Enforce consistent spacing before and after commas
      "comma-spacing": ["error", { before: false, after: true }],
      // Enforce consistent spacing between keys and values in object literal properties
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      // Enforce consistent spacing inside of blocks
      "block-spacing": ["error", "always"],
      // Enforce consistent spacing inside object curly braces
      "object-curly-spacing": ["error", "always"],
    },
  },
  LintingConfig.tseslintRecommended,
  LintingConfig.ignored,
  LintingConfig.tseslintPlugin,
  LintingConfig.playwright,
  {
    ignores: ["**/transform-v4-to-v3-audit.cjs"],
  },
);
