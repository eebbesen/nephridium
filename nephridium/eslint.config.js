import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  { ignores: [".config/*", "mochawesome-report/*", "assets/**.css"] }
];