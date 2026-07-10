import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypeScript from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  prettier,
  // needed due to how current E2E tests are run, with NEXT_DIST_DIR=tests/.next
  globalIgnores(['tests/.next/**']),
  {
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
])

export default eslintConfig
