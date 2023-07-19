#!/bin/sh

# https://stackoverflow.com/a/4774063
SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

docker exec accounting-postgres-1 pg_dump -U postgres --data-only -d postgres -n public > "${SCRIPTPATH}/backup.sql"
