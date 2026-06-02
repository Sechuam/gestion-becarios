# BecaGest

BecaGest is a Laravel, Inertia, and React application for managing internship programs. It covers education centers, interns, tasks, attendance tracking, absences, evaluations, dashboards, and exportable reports.

## Requirements

- PHP 8.3
- Composer 2
- Node.js 20 LTS and npm
- PostgreSQL 16 for local development
- Mailpit or another local mail catcher for email verification testing

The project is prepared to run with Laravel Herd on macOS, but it can also run with an equivalent local PHP, PostgreSQL, and Node.js setup.

## Installation

Install PHP and JavaScript dependencies:

```bash
composer install
npm install
```

Create the local environment file and application key:

```bash
cp .env.example .env
php artisan key:generate
```

Configure the database connection in `.env`. A typical local PostgreSQL setup looks like this:

```dotenv
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=gestion_becarios
DB_USERNAME=postgres
DB_PASSWORD=
```

Configure Mailpit if you want to test registration and email verification locally:

```dotenv
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_FROM_ADDRESS="no-reply@becagest.test"
MAIL_FROM_NAME="${APP_NAME}"
```

## Database Setup

Run migrations and seeders:

```bash
php artisan migrate --seed
```

The seeders create the base roles and permissions, sample education centers, and tutor data.

To reset the local database from scratch:

```bash
php artisan migrate:fresh --seed
```

## Development

If you are not using Herd, start Laravel with:

```bash
php artisan serve
```

Start Vite in another terminal:

```bash
npm run dev
```

When using Herd, open the configured local domain and keep Vite running for frontend assets and HMR.

For realtime updates, Reverb must run alongside Laravel and Vite. The Composer dev script starts the HTTP server, queue listener, Reverb, logs, and Vite together:

```bash
composer run dev
```

If you prefer separate terminals, start Reverb manually:

```bash
php artisan reverb:start --host=0.0.0.0 --port=8080
```

The websocket client reads `VITE_REVERB_*` variables from `.env`; copy the values from `.env.example` or run `php artisan reverb:install` to generate local app credentials.

## Main Modules

- Authentication with email verification, password reset, and two-factor support.
- Role and permission management for `admin`, `tutor`, and `intern`.
- Education centers with CRUD operations, internal notes, attachments, and exports.
- Intern management with profiles, documents, auditing, filters, soft deletes, and exports.
- Task management with assignment, Kanban workflow, comments, attachments, and "my tasks" views.
- Attendance tracking with clock-in/out, manual entries, schedules, absences, calendar views, and PDF reports.
- Evaluations with criteria, rubrics, self-evaluations, score history, weighted scores, and PDF reports.
- Dashboard and reports with role-based KPIs, charts, templates, Excel/PDF exports, and basic caching.

## Testing and Quality

Run the PHP test suite:

```bash
php artisan test
```

Run frontend checks:

```bash
npm run types:check
npm run lint:check
npm run format:check
npm run build
```

Run Laravel Pint:

```bash
./vendor/bin/pint
```

Code coverage can be generated if the local PHP installation has Xdebug or PCOV enabled:

```bash
php artisan test --coverage
```

If the command reports that no coverage driver is available, install and enable Xdebug or PCOV for the PHP version used by the CLI.

## Useful Commands

Create a clean seeded database:

```bash
php artisan migrate:fresh --seed
```

Run a specific Pest test file:

```bash
php artisan test tests/Feature/AttendanceReportTest.php
```

Build production assets:

```bash
npm run build
```

## Security and Git

The `.env` file and other sensitive or generated files are ignored by Git. Do not commit local credentials, database dumps, generated storage files, vendor dependencies, or local IDE metadata.

Important ignored files and directories include:

- `.env`
- `vendor/`
- `node_modules/`
- `storage/*.key`
- `public/build/`
- local IDE files
- generated IDE helper files

## Final Verification Checklist

Before delivery, verify:

- `php artisan test` passes.
- `php artisan migrate:fresh --seed` completes successfully.
- Frontend checks pass or any remaining issues are documented.
- `.env` and sensitive files are not tracked by Git.
- The GitHub branch contains the latest committed and pushed version of the application.
