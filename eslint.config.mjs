import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The kit is framework-agnostic: it cannot use next/image, so plain <img> is correct there.
  {
    files: ["packages/kit/**"],
    rules: { "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated copy of patterns/ and recipes/ for `agentic-ds-kit add`.
    "packages/kit/patterns-src/**",
    // Kit build output.
    "packages/kit/dist/**",
    // Other sessions' git worktrees (each lints itself).
    ".claude/worktrees/**",
  ]),
]);

export default eslintConfig;
