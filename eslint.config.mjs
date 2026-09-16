import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // These server-backed operating-system surfaces consume heterogeneous JSON
  // payloads from Supabase / external APIs. Keep the exception scoped here.
  {
    files: [
      "app/api/growth-admin/finance/**/*.ts",
      "app/api/growth-admin/google/**/*.ts",
      "app/api/growth-admin/deal-desk/**/*.ts",
      "app/growth-admin/deal-desk/**/*.tsx",
      "app/growth-admin/commercial/**/*.tsx",
      "app/growth-admin/finance/**/*.tsx",
      "lib/finance-*.ts",
      "lib/google-oauth-finance.ts",
      "lib/google-marketing-analytics.ts",
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
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
