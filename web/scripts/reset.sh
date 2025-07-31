#!/bin/sh

# https://unix.stackexchange.com/a/52066
set -e

rm -rf drizzle/

tsx scripts/db/teardown.ts

pnpm drizzle-kit generate
tsx scripts/db/setup.ts
