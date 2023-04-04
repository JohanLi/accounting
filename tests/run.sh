#!/bin/sh

source .env
export POSTGRES_PORT=$TEST_POSTGRES_PORT

docker-compose up -d test-postgres
prisma migrate dev --name test-init
prisma migrate reset --force

playwright test ; docker-compose rm --stop --force test-postgres
