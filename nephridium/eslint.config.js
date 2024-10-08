import globals from "globals";
import pluginJs from "@eslint/js";
import babelParser from "@babel/eslint-parser";

export default [
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  { ignores: [".config/*", "mochawesome-report/*", "assets/**.css"] },
  { languageOptions: { parser: babelParser, parserOptions: { "requireConfigFile": false }}},
];