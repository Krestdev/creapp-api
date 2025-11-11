import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,{
    ignores: ["node_modules/*","build/*","generated/*","prisma/*","*/__tests__/*","jest.config.js","coverage/*"]
  },
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
]);
