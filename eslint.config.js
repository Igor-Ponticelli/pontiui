import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";

/*
 * Flat config written out rather than adopted from a preset (D-17).
 *
 * A preset would be faster to add and would bring rules this library never
 * exercises, while hiding the ones it depends on. It would also fight the
 * Prettier setup that has been in place since Phase 0. Every rule below is
 * here because a guideline in COMPONENT_GUIDELINES.md asks for it.
 */
export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "coverage/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        // Both programs, because the test files live outside tsconfig.json on
        // purpose: test globals must never reach the published types.
        project: ["./tsconfig.json", "./tsconfig.test.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Library source.
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      "jsx-a11y": jsxA11y,
      "react-hooks": reactHooks,
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // TS-1: no `any`, in either direction.
      "@typescript-eslint/no-explicit-any": "error",

      // TS-2: `@ts-ignore` is banned outright; `@ts-expect-error` needs a reason.
      "@typescript-eslint/ban-ts-comment": [
        "error",
        { "ts-ignore": true, "ts-expect-error": "allow-with-description" },
      ],

      // TS-5: type-only imports must say so, which verbatimModuleSyntax requires.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],

      // E-3: named exports only, no default exports anywhere in src/.
      "no-restricted-syntax": [
        "error",
        {
          selector: "ExportDefaultDeclaration",
          message: "Named exports only (E-3). No default exports in src/.",
        },
      ],

      // R-8: nothing runs on import.
      "no-restricted-globals": ["error", "event", "name", "length"],
    },
  },

  // Tests may reach for things the shipped library may not.
  {
    files: ["src/**/*.test.{ts,tsx}", "test/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  // Build and config files run in Node and are not part of the package.
  {
    files: ["*.config.{ts,js,mjs}", "scripts/**/*.mjs"],
    languageOptions: {
      globals: globals.node,
    },
    extends: [tseslint.configs.disableTypeChecked],
  },
);
