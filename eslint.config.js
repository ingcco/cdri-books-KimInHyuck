import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import unusedImports from "eslint-plugin-unused-imports";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import importX from "eslint-plugin-import-x";
import tailwindcss from "eslint-plugin-tailwindcss";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default tseslint.config(
  // .claude/**는 하네스(스킬/스크립트) 전용 — 앱 eslint 대상 아님(node 스크립트라 브라우저 globals와 불일치)
  { ignores: ["dist", "node_modules", "coverage", "playwright-report", ".claude/**"] },
  { settings: { react: { version: "detect" } } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  jsxA11y.flatConfigs.recommended,
  ...tanstackQuery.configs["flat/recommended"],
  {
    ...tailwindcss.configs.recommended,
    settings: {
      tailwindcss: { cssConfigPath: "./src/index.css" },
    },
    rules: {
      ...tailwindcss.configs.recommended.rules,
      // 클래스 정렬은 prettier-plugin-tailwindcss가 SOT — eslint 규칙과 중복/충돌이라 off (역할 분리)
      "tailwindcss/classnames-order": "off",
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
      "import-x": importX,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "warn",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
      ],
      "import-x/no-unresolved": "off",
      "import-x/order": [
        "warn",
        {
          groups: ["builtin", "external", "parent", "sibling", "index"],
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "never",
        },
      ],
    },
  },
  prettierConfig
);
