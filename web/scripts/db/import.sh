#!/bin/sh

SCRIPTPATH="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

docker exec -i accounting-postgres-1 psql -U postgres -d postgres < "${SCRIPTPATH}/backup.sql"
