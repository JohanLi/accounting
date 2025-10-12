/** @type {import("prettier").Config} */

const config = {
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  importOrder: ['^@core/(.*)$', '^@server/(.*)$', '^@ui/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    // has to be last, see: https://github.com/tailwindlabs/prettier-plugin-tailwindcss?tab=readme-ov-file#compatibility-with-other-prettier-plugins
    'prettier-plugin-tailwindcss',
  ],
}

export default config
