/** @type {import('prettier').Config} */
module.exports = {
	printWidth: 80,

	tabWidth: 2,
	useTabs: false,

	singleQuote: true,
	jsxSingleQuote: false,
	semi: true,

	bracketSpacing: true,
	bracketSameLine: false,

	proseWrap: "preserve",
	htmlWhitespaceSensitivity: "css",
	endOfLine: "lf",
	embeddedLanguageFormatting: "auto",

	singleAttributePerLine: true,
	trailingComma: "all",

	plugins: ["prettier-plugin-tailwindcss"],

	overrides: [
		{
			files: "*.{ts,tsx}",
			options: {
				parser: "typescript",
			},
		},
		{
			files: "*.md",
			options: {
				proseWrap: "always",
			},
		},
	],
};
