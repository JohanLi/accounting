#!/bin/sh

source .env
export POSTGRES_PORT=$TEST_POSTGRES_PORT
export DATABASE_URL=$TEST_DATABASE_URL

docker-compose up -d test-postgres
prisma migrate dev --name test-init
prisma migrate reset --force
playwright test
