#!/bin/sh

# https://unix.stackexchange.com/a/52066
set -e

docker volume create --name=accounting-postgres
docker compose up -d
prisma migrate dev --name init
prisma db seed
