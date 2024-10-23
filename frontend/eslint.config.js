import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-config-prettier";
import globals from "globals";

const commonParserOptions = {
	ecmaFeatures: { jsx: true },
	tsconfigRootDir: ".",
};

export default [
	{
		ignores: ["dist/**", "node_modules/**", "coverage/**", "*.config.*"],
	},
	{
		files: ["src/**/*.{ts,tsx}"],
		plugins: {
			"@typescript-eslint": tseslint,
			react: reactPlugin,
			"react-hooks": reactHooksPlugin,
			"react-refresh": reactRefreshPlugin,
			import: importPlugin,
		},
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: "module",
			parser: tseslintParser,
			parserOptions: {
				...commonParserOptions,
				project: ["./tsconfig.app.json"],
			},
			globals: {
				...globals.browser,
				...globals.es2021,
			},
		},
		settings: {
			"import/resolver": {
				typescript: {
					alwaysTryTypes: true,
					project: "./tsconfig.app.json",
				},
			},
			react: {
				version: "detect",
			},
		},
		rules: {
			"import/first": "error",
			"import/no-duplicates": "error",
			"import/order": [
				"error",
				{
					groups: [
						"builtin",
						"external",
						"internal",
						"parent",
						"sibling",
						"index",
					],
					pathGroups: [
						{
							pattern: "react",
							group: "builtin",
							position: "before",
						},
						{
							pattern: "@/**",
							group: "internal",
							position: "after",
						},
					],
					"newlines-between": "always",
					alphabetize: {
						order: "asc",
						caseInsensitive: true,
					},
				},
			],

			"@typescript-eslint/explicit-function-return-type": [
				"error",
				{
					allowExpressions: true,
					allowTypedFunctionExpressions: true,
					allowHigherOrderFunctions: true,
					allowDirectConstAssertionInArrowFunctions: true,
				},
			],
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{
					prefer: "type-imports",
					fixStyle: "separate-type-imports",
				},
			],

			"react/jsx-uses-react": "off",
			"react/react-in-jsx-scope": "off",
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",

			"no-warning-comments": "error",
			"multiline-comment-style": ["error", "bare-block"],
			"no-inline-comments": "error",
			"@typescript-eslint/ban-ts-comment": "error",
			"no-restricted-syntax": [
				"error",
				{
					selector: "Program > :matches(Line, Block)Comment",
					message:
						"Comments are not allowed in this codebase. Use clear, self-documenting code instead.",
				},
			],
		},
	},
	{
		files: ["*.config.{js,ts}"],
		plugins: {
			"@typescript-eslint": tseslint,
			import: importPlugin,
		},
		languageOptions: {
			ecmaVersion: 2024,
			sourceType: "module",
			parser: tseslintParser,
			parserOptions: {
				...commonParserOptions,
				project: ["./tsconfig.node.json"],
			},
		},
		settings: {
			"import/resolver": {
				typescript: {
					alwaysTryTypes: true,
					project: "./tsconfig.node.json",
				},
			},
		},
		rules: {
			"import/order": ["error", { "newlines-between": "always" }],
		},
	},
	prettier,
];
