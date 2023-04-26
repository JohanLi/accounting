/**
 * @type {import('prettier').Options}
 */
module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  semi: false,
  plugins: [require.resolve('@plasmohq/prettier-plugin-sort-imports')],
  importOrder: ['^@plasmohq/(.*)$', '^~(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
}
