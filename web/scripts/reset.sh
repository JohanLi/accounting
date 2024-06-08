#!/bin/sh

# https://unix.stackexchange.com/a/52066
set -e

rm -rf drizzle/

pnpm run swc scripts/db/teardown.ts

pnpm drizzle-kit generate
pnpm run swc scripts/db/setup.ts
