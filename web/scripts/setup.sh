#!/bin/sh

# https://unix.stackexchange.com/a/52066
set -e

docker volume create --name=accounting-postgres
docker compose up -d --wait

pnpm drizzle-kit generate
pnpm run swc scripts/db/setup.ts
