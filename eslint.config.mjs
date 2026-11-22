import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Data-fetching components intentionally call setState inside effects to
    // load remote data on mount / dependency change. The rule is a perf hint
    // that produces false positives for this standard pattern.
    files: [
      "components/dashboard/**/*.tsx",
      "components/tuitions/**/*.tsx",
      "components/tuition-card.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
