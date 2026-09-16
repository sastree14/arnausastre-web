import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Finance OS uses heterogeneous Supabase JSON payloads while the schema is being
  // normalized. Keep the exception local to the server-side finance integration
  // layer instead of weakening the rule for the rest of the application.
  {
    files: [
      "app/api/growth-admin/finance/**/*.ts",
      "app/api/growth-admin/google/**/*.ts",
      "lib/finance-*.ts",
      "lib/google-oauth-finance.ts",
      "lib/growth-admin-performance.ts",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["lib/finance-gmail.ts"],
    rules: {
      "prefer-const": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
