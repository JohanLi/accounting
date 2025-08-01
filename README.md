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
