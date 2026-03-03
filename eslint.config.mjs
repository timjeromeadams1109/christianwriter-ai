import tseslint from "typescript-eslint";
import nextPlugin from "@next/eslint-plugin-next";

export default [
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  },
  {
    ignores: [".next/", "node_modules/"],
  },
];
