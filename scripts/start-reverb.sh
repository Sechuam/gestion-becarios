#!/usr/bin/env sh
set -eu

case "${PORT:-}" in
    ''|*[!0-9]*)
        SERVER_PORT=8080
        ;;
    *)
        SERVER_PORT="$PORT"
        ;;
esac

echo "Starting Reverb on 0.0.0.0:${SERVER_PORT}"

export REVERB_SERVER_HOST=0.0.0.0
export REVERB_SERVER_PORT="${SERVER_PORT}"

php artisan config:clear

php artisan reverb:start --host=0.0.0.0 --port="${SERVER_PORT}"
