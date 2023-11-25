# Accounting

For personal use. The user experience I'm aiming for is:

- A Chrome extension for getting bank transactions and downloading receipts
- Receipts, or entire folders of them, are drag-and-dropped into a web app
- The backend recognizes typical ones, determining the totals, VAT and financial account codes
- Portability is handled through being able to import and export SIE files

## Getting started

```
pnpm install
pnpm run setup
pnpm dev
```

If using Apple silicon, you'll need to [do this](https://github.com/Automattic/node-canvas/issues/2036#issuecomment-1627742027)
before running `pnpm install`.

#### Updating dependencies

```
pnpm update "\!p-limit" "\!pdfjs-dist" --latest
```

The latest versions of the excluded packages cause issues.

p-limit: I'm using it in content scripts (browser). Possible explanation of
why 5.0.0 isn't working out of the box: https://github.com/vercel/next.js/issues/58052#issuecomment-1807047402
Not a critical dependency.

pdfjs-dist: It's likely a TypeScript issue. They no longer export CJS .js in v4,
but ESM .mjs. When importing .mjs, the .d.ts files aren't picked up. v3 works
just fine, so I'm leaving it alone for now.
