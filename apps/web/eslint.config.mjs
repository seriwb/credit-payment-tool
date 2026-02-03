import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import globals from "globals";
import { dirname } from "path";
// import tailwind from "eslint-plugin-tailwindcss";
import tsEslint from "typescript-eslint";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default tsEslint.config(
  {
    ignores: [
      ".next/",
      ".husky/",
      "out/",
      "globals.d.ts",
      "next.config.ts",
      "next-env.d.ts",
      "postcss.config.mjs",
      "tsconfig.json",
      "tailwind.config.js",
      "src/components/ui/", // shadcn/ui components
      "src/hooks/use-mobile.ts", // shadcn/ui components
    ],
  },
  js.configs.recommended,
  tsEslint.configs.recommendedTypeChecked,
  tsEslint.configs.stylisticTypeChecked,
  ...nextVitals,
  ...nextTs,
  // ...tailwind.configs["flat/recommended"],  // TODO: wait v4 support
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parser: tsEslint.parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: __dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-useless-constructor": "warn",
      "react/sort-comp": "warn",
      "require-atomic-updates": "off",
      "@typescript-eslint/consistent-type-definitions": ["warn", "type"],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/prefer-interface": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "parameter",
          format: ["camelCase"],
          filter: {
            regex: "^[a-z_]{1}([a-zA-Z0-9_]{0,})$",
            match: false,
          },
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@next/next/no-html-link-for-pages": ["off"],
      "@next/next/no-img-element": "off",
      "react/no-children-prop": "off",
      "react-hooks/rules-of-hooks": "off",
    },
  }
);
