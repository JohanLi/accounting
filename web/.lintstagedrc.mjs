// https://nextjs.org/docs/app/api-reference/config/eslint#running-lint-on-staged-files
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(__dirname, f))
    .join(' --file ')}`

const config = {
  '*.{ts,tsx}': ['prettier --write', buildEslintCommand],
  '*.{css,json,md}': ['prettier --write'],
}

export default config
