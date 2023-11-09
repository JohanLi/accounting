#!/bin/sh

# https://stackoverflow.com/a/4774063
scriptPath="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
path="$scriptPath/backup.sql"
pathWithTimestamp="$scriptPath/backup-$(date +%Y-%m-%dT%H:%M:%S).sql"

docker exec accounting-postgres-1 pg_dump -U postgres --data-only -d postgres -n public > $path
cp "$path" "$pathWithTimestamp"
