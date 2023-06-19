#!/bin/sh

# https://unix.stackexchange.com/a/52066
set -e

export POSTGRES_PORT=5433

docker compose --file docker-compose.test.yml up -d --wait

sh ./scripts/reset.sh

playwright test
