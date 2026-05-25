# BecaGest

Aplicacion Laravel + Inertia + React para gestionar practicas: centros educativos, becarios, tareas, asistencia, evaluaciones, dashboard y reportes.

## Requisitos

- PHP 8.3
- Composer 2
- Node.js 20 LTS y npm
- PostgreSQL 16 para desarrollo local
- Mailpit para probar correos en local

El proyecto esta preparado para Laravel Herd en macOS, aunque tambien puede ejecutarse con una instalacion local equivalente.

## Instalacion

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

Configura la base de datos en `.env`. En local con PostgreSQL:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=gestion_becarios
DB_USERNAME=postgres
DB_PASSWORD=
```

Configura Mailpit si quieres probar verificacion de email:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_FROM_ADDRESS="no-reply@becagest.test"
MAIL_FROM_NAME="${APP_NAME}"
```

## Base de datos

```bash
php artisan migrate --seed
```

Los seeders crean los roles y permisos base, centros educativos y tutores de prueba.

Para reiniciar el entorno local:

```bash
php artisan migrate:fresh --seed
```

## Desarrollo

En una terminal:

```bash
php artisan serve
```

En otra terminal:

```bash
npm run dev
```

Con Herd, basta con dejar Vite activo y abrir el dominio local configurado por Herd.

## Modulos principales

- Autenticacion con verificacion de email y doble factor.
- Roles y permisos: `admin`, `tutor`, `intern`.
- Centros educativos: CRUD, notas internas, adjuntos y exportacion.
- Becarios: CRUD, perfil, documentos, auditoria, filtros, soft delete y exportacion.
- Tareas: CRUD, asignacion, Kanban, comentarios, adjuntos y vista de mis tareas.
- Control horario: fichaje, registro manual, horarios, ausencias, calendario y PDF.
- Evaluaciones: criterios, rubricas, autoevaluacion, historial e informe PDF.
- Dashboard y reportes: KPIs por rol, graficos, plantillas, Excel/PDF y cache basica.

## Calidad

```bash
php artisan test
npm run types:check
npm run lint:check
npm run format:check
npm run build
```

Para cobertura, instala un driver de cobertura compatible con PHP si no esta disponible y ejecuta:

```bash
php artisan test --coverage
```

## Seguridad y Git

El archivo `.env` y otros archivos sensibles estan ignorados por Git. No subas claves locales, credenciales, dumps de base de datos ni contenido generado en `storage`.

