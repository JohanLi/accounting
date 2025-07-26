#!/bin/sh

# globalSetup in Playwright can also be used to perform what this script does, but one issue is that
# webServer (with `next dev`), which depends on globalSetup, actually runs before globalSetup.
# You can also do the equivalent of webServer inside globalSetup itself, but it didn't seem as convenient
# as this approach.

# https://unix.stackexchange.com/a/52066
set -e

export PORT=3001
export POSTGRES_PORT=5433

docker compose --file docker-compose.test.yml up -d --wait

sh ./scripts/reset.sh

pnpm exec playwright test "$1"
