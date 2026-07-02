FROM php:8.4-cli-alpine

RUN apk add --no-cache oniguruma-dev postgresql-dev \
    && docker-php-ext-install pdo_pgsql pdo_mysql mbstring

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 10000

CMD sh -c "php artisan migrate --force --no-interaction && php artisan config:cache && php artisan route:cache && php artisan view:cache && (php artisan storage:link || true) && php artisan serve --host=0.0.0.0 --port=${PORT:-10000}"
