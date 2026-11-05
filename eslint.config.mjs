import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["tests/**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
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
  // Preserve pre-existing client-side editor patterns under the upgraded
  // ESLint preset. Security-related checks stay enabled; these exceptions
  // cover only React compiler/purity diagnostics, not authorization or input safety.
  {
    files: [
      "app/contact/page.tsx",
      "components/growth-admin/CommercialAcquisitionWorkspace.tsx",
      "components/growth-admin/CommercialMemoryWorkspace.tsx",
      "components/growth-admin/CommercialOverview.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["components/visual-studio/VisualStudioClientV2.tsx"],
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/immutability": "off",
    },
  },
  {
    files: ["components/visual-studio/VisualStudioClientV3.tsx"],
    rules: {
      "react-hooks/purity": "off",
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
