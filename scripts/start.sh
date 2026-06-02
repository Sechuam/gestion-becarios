#!/usr/bin/env sh
set -eu

if [ "${APP_PROCESS:-web}" = "reverb" ]; then
    exec sh scripts/start-reverb.sh
fi

php artisan migrate --force
BROADCAST_CONNECTION=log php artisan db:seed --force
php artisan storage:link --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

exec php artisan serve --host 0.0.0.0 --port "${PORT:-8080}"
