#!/bin/sh

# https://unix.stackexchange.com/a/52066
set -e

export POSTGRES_PORT=5433
docker compose --file docker-compose.test.yml up -d

# https://github.com/prisma/prisma/issues/6603
# https://github.com/prisma/prisma/discussions/12501
prisma generate

prisma migrate dev --name init-test
prisma migrate reset --force
playwright test
