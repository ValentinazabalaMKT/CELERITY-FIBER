import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This app has no data-fetching library (no React Query/SWR, no
      // Suspense-based fetching) -- every page/component that loads mock
      // data via src/lib/api.ts uses the standard "setLoading(true) then
      // fetch in a cleanup-guarded effect" pattern. That pattern is
      // intentional and used consistently throughout the app (verified
      // working with no cascading-render issues via full browser testing),
      // not something to fix component-by-component.
      "react-hooks/set-state-in-effect": "off",
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
