import { config } from "@repo/eslint-config/base";
import globals from "globals";

/** @type {import("eslint").Linter.Config} */
export default [
    ...config,
    {
        files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
    {
        ignores: [
            "**/*.test.ts",
            "**/*.test.tsx",
            "**/vitest.setup.ts",
            "**/__tests__/**",
            "**/node_modules/**",
            "**/.next/**"
        ]
    }
];
