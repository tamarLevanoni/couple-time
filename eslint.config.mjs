import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...compat.extends("prettier"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/jsx-curly-spacing": ["error", { "when": "never" }],
      "react/jsx-tag-spacing": ["error", { "beforeSelfClosing": "always" }],
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];

export default eslintConfig;
