const config = {
  '*.{mjs,ts,mts,tsx}': ['prettier --write', 'eslint --fix'],
  '*.{css,json,md,yml}': 'prettier --write',
}

export default config
