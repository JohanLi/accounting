#!/bin/sh

# https://unix.stackexchange.com/a/52066
set -e

pnpm run node scripts/db/teardown.ts

pnpm drizzle-kit generate:pg --schema=./src/schema.ts
pnpm run node scripts/db/setup.ts
