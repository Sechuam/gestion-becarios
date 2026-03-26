# Guia del proyecto `gestion-becarios`

Esta guia esta pensada como si yo fuera tu profesor: te explico que hace cada carpeta, que papel cumple cada archivo importante y como encajan backend, base de datos y frontend.

Nota importante:

- No incluyo `vendor/` ni `node_modules/` archivo por archivo porque no son codigo tuyo: son dependencias instaladas por Composer y npm.
- Tampoco detallo `public/build/` ni caches generadas porque son artefactos compilados.
- En los archivos repetitivos generados automaticamente (`resources/js/routes/*`, `resources/js/actions/*`, muchos `components/ui/*`) te explico el patron para que entiendas todos sin tener que estudiar cientos de lineas iguales.

---

## 1. Vision general de la arquitectura

Tu proyecto usa esta combinacion:

- Laravel 12 como backend.
- Inertia.js para conectar Laravel con React sin montar una API REST separada para todo.
- React + TypeScript para la interfaz.
- Tailwind CSS para estilos.
- Fortify para autenticacion.
- Spatie Permission para roles y permisos.
- Spatie Media Library para subir y asociar archivos.
- Maatwebsite Excel para exportaciones.

La idea general es:

1. El usuario entra a una ruta Laravel.
2. Un controlador consulta la base de datos.
3. Laravel devuelve una pagina Inertia, por ejemplo `interns/index`.
4. React renderiza `resources/js/pages/interns/index.tsx`.

Ejemplo real del patron:

```php
return Inertia::render('interns/index', [
    'interns' => $interns,
    'filters' => $request->only([...]),
]);
```

Eso conecta con:

```tsx
export default function Index({ interns, filters = {} }) {
    return <AppLayout>{/* interfaz */}</AppLayout>;
}
```

---

## 2. Raiz del proyecto

### `composer.json`

Es el mapa del backend PHP.

- Define dependencias Laravel y paquetes extra.
- Define scripts como `composer run dev`, `composer test`, `composer setup`.

Fragmento clave:

```json
"require": {
  "laravel/framework": "^12.0",
  "inertiajs/inertia-laravel": "^2.0",
  "laravel/fortify": "^1.30",
  "spatie/laravel-permission": "^7.2",
  "spatie/laravel-medialibrary": "^11.0.0",
  "maatwebsite/excel": "^3.1"
}
```

Lectura didactica:

- `inertia-laravel`: permite enviar paginas a React.
- `fortify`: login, registro, reset password y 2FA.
- `spatie/permission`: roles y permisos.
- `medialibrary`: documentos de becarios y centros.
- `excel`: exportaciones a `.xlsx`.

### `package.json`

Es el mapa del frontend.

- `vite`: compilacion.
- `react`, `react-dom`.
- `@inertiajs/react`.
- `@dnd-kit/*`: drag and drop para el kanban.
- `framer-motion`: animaciones.
- `@radix-ui/*`: primitives UI.

Fragmento:

```json
"scripts": {
  "build": "vite build",
  "dev": "vite",
  "lint": "eslint . --fix",
  "types:check": "tsc --noEmit"
}
```

### `vite.config.ts`

Configura Vite.

```ts
laravel({
    input: ['resources/css/app.css', 'resources/js/app.tsx'],
    ssr: 'resources/js/ssr.tsx',
    refresh: true,
})
```

Esto le dice a Vite:

- entrada CSS: `resources/css/app.css`
- entrada JS principal: `resources/js/app.tsx`
- soporte SSR: `resources/js/ssr.tsx`

### `tsconfig.json`

Configura TypeScript.

- `strict: true`: tipado estricto.
- alias `@/*` hacia `resources/js/*`.

```json
"paths": {
  "@/*": ["./resources/js/*"]
}
```

### `eslint.config.js`

Reglas de calidad para frontend.

- activa reglas JS, TS y React.
- ordena imports.
- ignora carpetas generadas como `resources/js/routes/**` y `components/ui/*`.

### `tailwind.config.js`

Busca clases Tailwind dentro de `resources/**/*.{js,ts,jsx,tsx}`.

### `phpunit.xml`

Config de testing PHP/Laravel.

### `pint.json`

Config del formateador PHP `Laravel Pint`.

### `artisan`

Comando CLI de Laravel. Se usa para `migrate`, `serve`, `test`, etc.

### `.env` y `.env.example`

- `.env`: configuracion real local.
- `.env.example`: plantilla.

### `components.json`

Suele usarse con `shadcn-ui` para registrar configuracion de componentes.

---

## 3. Carpeta `bootstrap/`

### `bootstrap/app.php`

Es el arranque moderno de Laravel.

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
```

Aqui:

- se cargan rutas web, api y consola.
- se registran middlewares personalizados.

Tambien aliasa middlewares:

```php
$middleware->alias([
    'tutor' => \App\Http\Middleware\EnsureTutor::class,
    'staff' => \App\Http\Middleware\EnsureStaff::class,
    'admin' => \App\Http\Middleware\EnsureAdmin::class,
]);
```

### `bootstrap/providers.php`

Lista providers propios:

- `AppServiceProvider`
- `FortifyServiceProvider`

---

## 4. Carpeta `config/`

Estos archivos configuran Laravel. Muchos vienen de base, pero siguen siendo importantes.

### `config/app.php`

Config global:

- nombre app
- entorno
- debug
- URL
- locale
- timezone

### `config/auth.php`

Autenticacion:

- guard `web`
- provider `users`
- reset passwords

### `config/cache.php`

Cache por defecto usando base de datos.

### `config/database.php`

Conexion a BD. Tu default es `sqlite`:

```php
'default' => env('DB_CONNECTION', 'sqlite'),
```

Tambien deja preparadas conexiones MySQL, MariaDB, PostgreSQL y SQL Server.

### `config/filesystems.php`

Discos de almacenamiento:

- `local` apunta a `storage/app/private`
- `public` apunta a `storage/app/public`

Esto es importante para media y adjuntos.

### `config/fortify.php`

Configura login, registro, reset password y 2FA.

### `config/inertia.php`

Ajustes del puente Laravel <-> Inertia.

### `config/laravel-pdf.php`

Config del paquete PDF de Spatie.

### `config/logging.php`

Canales de logs.

### `config/mail.php`

Configuracion de envio de correos.

### `config/media-library.php`

Config del paquete de archivos de Spatie.

### `config/permission.php`

Muy importante para roles y permisos.

Has personalizado esta tabla:

```php
'role_has_permissions' => 'role_permissions',
```

Eso significa que no usas el nombre default; luego tus migraciones lo reflejan.

### `config/queue.php`

Colas con driver `database`.

### `config/sanctum.php`

Tokens / sesiones stateful.

### `config/services.php`

Credenciales de servicios externos: Postmark, Resend, SES, Slack.

### `config/session.php`

Sesiones guardadas en base de datos.

---

## 5. Carpeta `routes/`

Aqui defines la entrada del sistema.

### `routes/web.php`

Es la ruta mas importante del proyecto.

Define:

- home publica
- dashboard
- becarios
- centros
- tareas
- tipos de practica
- roles
- usuarios
- paginas placeholder como evaluaciones y reportes

Ejemplo:

```php
Route::get('becarios', [InternController::class, 'index'])
    ->name('becarios.index')
    ->middleware('staff');
```

Lectura:

- URL: `/becarios`
- controlador: `InternController@index`
- nombre interno: `becarios.index`
- seguridad: solo `staff`

Tambien usas `Route::resource(...)` para CRUD compacto.

### `routes/settings.php`

Rutas de perfil, password, apariencia y 2FA.

### `routes/api.php`

Expone `education-centers` como `apiResource`.

### `routes/console.php`

Comando demo `inspire`.

---

## 6. Carpeta `app/Models/`

Los modelos representan tablas y relaciones.

### `app/Models/User.php`

Modelo del usuario.

Usa traits clave:

```php
use HasFactory, HasRoles, InteractsWithMedia, LogsActivity, Notifiable, TwoFactorAuthenticatable;
```

Eso significa:

- fabrica para tests/seeds
- roles con Spatie
- media asociada
- log de actividad
- notificaciones
- soporte 2FA

Metodos importantes:

- `intern()`: relacion 1 a 1 con becario.
- `isAdmin()`, `isTutor()`, `isIntern()`, `isStaff()`: helpers de rol.

Detalle interesante:

```php
public function isIntern(): bool
{
    return $this->normalizedRoleNames()
        ->intersect(['intern', 'becario'])
        ->isNotEmpty();
}
```

Esto tolera dos nombres de rol: `intern` y `becario`.

### `app/Models/EducationCenter.php`

Representa centros educativos.

- usa `SoftDeletes`
- usa `InteractsWithMedia`
- relacion `interns(): HasMany`

Coleccion media:

```php
public function registerMediaCollections(): void
{
    $this->addMediaCollection('agreement_pdf')->singleFile();
}
```

Solo guarda un PDF de convenio por centro.

### `app/Models/Intern.php`

Uno de los modelos mas ricos del proyecto.

Traits:

- `HasFactory`
- `InteractsWithMedia`
- `LogsActivity`
- `SoftDeletes`

Logica muy importante en `booted()`:

```php
static::saving(function (Intern $intern) {
    if ($intern->status === 'abandoned') {
        return;
    }

    $end = $intern->end_date ? Carbon::parse($intern->end_date)->endOfDay() : null;
    $today = Carbon::today();

    if ($end && $today->gt($end)) {
        $intern->status = 'completed';
    } else {
        $intern->status = 'active';
    }
});
```

Esto recalcula automaticamente el estado segun la fecha fin, salvo si esta abandonado.

Calcula tambien:

- `progress`: porcentaje transcurrido entre inicio y fin.
- `is_delayed`: si la practica ha pasado de fecha y no esta completada.

Relaciones:

- `user()`
- `educationCenter()`
- `companyTutor()`

Adjuntos media:

- `dni`
- `agreement`
- `insurance`

### `app/Models/PracticeType.php`

Catalogo de tipos de practica. Se usa para clasificar tareas.

### `app/Models/Task.php`

Modelo de tareas.

Relaciones:

- `practiceType()`
- `creator()`
- `interns()` con tabla pivote `intern_task`
- `comments()`
- `statusLogs()`

Media:

```php
$this->addMediaCollection('attachments');
```

### `app/Models/TaskComment.php`

Comentarios de tareas.

### `app/Models/TaskStatusLog.php`

Historial de cambios de estado.

Ojo didactico: aqui hay un posible typo en la relacion:

```php
return $this->belongsTo(User::class, 'chenged_by');
```

Probablemente querias `changed_by`. Es un buen ejemplo de bug silencioso.

---

## 7. Carpeta `app/Http/Controllers/`

Los controladores reciben peticiones y deciden que responder.

### `Controller.php`

Base vacia comun para todos.

### `EducationCenterController.php`

Controla centros educativos.

Metodos:

- `index()`: listado con filtros, ordenacion y paginacion.
- `create()`: formulario.
- `store()`: crear centro y subir convenio.
- `edit()`: editar.
- `show()`: ver un centro y sus becarios.
- `update()`
- `destroy()`
- `export()`: exportar historico de becarios de un centro.
- `exportIndex()`: exportar centros.
- `restore()`
- `forceDelete()`
- `updateNotes()`
- `myCenter()`: centro del becario logueado.

Patron del index:

```php
if ($request->filled('search')) {
    $query->where('name', 'ilike', '%'.$request->search.'%');
}
```

Esto aplica busqueda.

### `InternController.php`

CRUD y gestion completa de becarios.

Metodos principales:

- `index()`
- `create()`
- `store()`
- `show()`
- `edit()`
- `update()`
- `destroy()`
- `export()`
- `restore()`
- `forceDelete()`
- `updateNotes()`
- `syncInternMedia()`

Parte muy importante del alta:

```php
DB::transaction(function () use ($request, &$intern) {
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make('password123'),
    ]);

    $user->assignRole('intern');
    $intern = $user->intern()->create($request->validated());
});
```

Esto te enseña algo clave:

- un becario en realidad son dos registros coordinados:
  - `users`
  - `interns`

### `PracticeTypeController.php`

CRUD de tipos de practica, solo admin.

Tiene helper interno:

```php
protected function ensureAdmin()
{
    if (! Auth::user()?->isAdmin()) {
        abort(403);
    }
}
```

### `RolesController.php`

Gestiona roles y permisos con Spatie.

Funciones:

- listar roles y permisos
- crear rol
- actualizar nombre visible y estado
- borrar rol
- activar o desactivar permisos

### `TaskController.php`

Es el controlador mas completo del modulo academico.

Funciones:

- `index()`: listado / kanban de tareas.
- `myTasks()`: tareas del becario.
- `create()`
- `store()`
- `edit()`
- `update()`
- `destroy()`
- `updateStatus()`
- `show()`
- `complete()`

Alta de tarea:

```php
$task = Task::create([
    ...Arr::only($validated, [
        'title', 'description', 'status', 'priority', 'due_date', 'practice_type_id',
    ]),
    'created_by' => Auth::id(),
]);
```

Luego asigna becarios segun tres estrategias:

- por usuario
- por modulo
- por centro

Y guarda historial:

```php
TaskStatusLog::create([
    'task_id' => $task->id,
    'from_status' => null,
    'to_status' => $task->status,
    'changed_by' => Auth::id(),
    'changed_at' => now(),
]);
```

### `UsersController.php`

Lista usuarios y cambia rol principal.

### `Settings/ProfileController.php`

- mostrar perfil
- actualizar nombre/email
- borrar cuenta

### `Settings/PasswordController.php`

- mostrar pantalla de password
- actualizar password

### `Settings/TwoFactorAuthenticationController.php`

Renderiza la pagina de 2FA y exige confirmacion de password si Fortify lo pide.

---

## 8. Carpeta `app/Http/Requests/`

Aqui van las validaciones.

Ventaja didactica: el controlador queda mas limpio.

### `StoreEducationCenterRequest.php`

Reglas del alta/edicion de centros.

Ejemplo:

```php
'code' => 'required|string|max:50|unique:education_centers,code,'.$schoolId,
'agreement_file' => 'nullable|file|mimes:pdf|max:5120',
```

### `StoreInternRequest.php` y `UpdateInternRequest.php`

Validan becarios:

- email unico
- centro existente
- DNI con regex
- fechas
- total de horas
- adjuntos
- datos de tutor

Regex interesante:

```php
'dni' => 'required|string|regex:/^[XYZ]?\d{7,8}[A-Z]$/i|unique:interns,dni'
```

### `StorePracticeTypeRequest.php` y `UpdatePracticeTypeRequest.php`

Validan nombre, descripcion, prioridad, color y si esta activo.

### `StoreTaskRequest.php` y `UpdateTaskRequest.php`

Validan tareas:

- titulo
- estado
- fecha entrega
- tipo de practica
- asignaciones

### `Settings/*`

- `PasswordUpdateRequest`
- `ProfileDeleteRequest`
- `ProfileUpdateRequest`
- `TwoFactorAuthenticationRequest`

Se apoyan en traits reutilizables.

---

## 9. Carpeta `app/Concerns/`

Traits reutilizables.

### `PasswordValidationRules.php`

Centraliza reglas de password.

```php
protected function passwordRules(): array
{
    return ['required', 'string', Password::default(), 'confirmed'];
}
```

### `ProfileValidationRules.php`

Centraliza reglas de nombre y email.

---

## 10. Carpeta `app/Actions/Fortify/`

Acciones que Fortify llama internamente.

### `CreateNewUser.php`

Valida perfil + password y crea usuario.

### `ResetUserPassword.php`

Reasigna password tras "olvidaste tu contraseña".

---

## 11. Carpeta `app/Http/Middleware/`

Seguridad y comportamiento compartido.

### `EnsureAdmin.php`

Solo deja pasar admins.

### `EnsureStaff.php`

Solo deja pasar usuarios staff (`admin` o `tutor`).

### `EnsureTutor.php`

Solo deja pasar tutores.

### `HandleAppearance.php`

Comparte el tema visual (`light`, `dark`, `system`) leyendo cookie.

### `HandleInertiaRequests.php`

Muy importante: comparte props globales con React.

```php
'auth' => [
    'user' => $request->user() ? array_merge($request->user()->toArray(), [
        'roles' => $request->user()->getRoleNames(),
        'permissions' => $request->user()->getAllPermissions()->pluck('name'),
    ]) : null,
],
```

Gracias a eso, desde React puedes saber roles y permisos del usuario actual.

---

## 12. Carpeta `app/Providers/`

### `AppServiceProvider.php`

Configura defaults globales.

- usa `CarbonImmutable`
- prohíbe comandos destructivos en produccion
- endurece politicas de password en produccion

### `FortifyServiceProvider.php`

Conecta Fortify con tus paginas Inertia.

Ejemplo:

```php
Fortify::loginView(fn (Request $request) => Inertia::render('auth/login', [
    'canResetPassword' => Features::enabled(Features::resetPasswords()),
    'canRegister' => Features::enabled(Features::registration()),
]));
```

---

## 13. Carpeta `app/Exports/`

Exportaciones Excel.

### `EducationCentersExport.php`

- exporta centros
- permite columnas configurables
- filtra por busqueda y borrados

### `InternsExport.php`

- exporta becarios
- respeta filtros activos
- permite columnas configurables

### `UsersExport.php`

Muy simple: devuelve todos los usuarios. Parece menos desarrollado que los otros.

---

## 14. Carpeta `database/migrations/`

Aqui esta la evolucion de la base de datos.

### Base Laravel

- `0001_01_01_000000_create_users_table.php`
  - crea `users`, `password_reset_tokens`, `sessions`
- `0001_01_01_000001_create_cache_table.php`
  - crea `cache`, `cache_locks`
- `0001_01_01_000002_create_jobs_table.php`
  - crea `jobs`, `job_batches`, `failed_jobs`

### Seguridad

- `2025_08_14_170933_add_two_factor_columns_to_users_table.php`
  - agrega columnas 2FA a `users`
- `2026_03_06_103458_create_personal_access_tokens_table.php`
  - tokens Sanctum

### Roles y permisos

- `2026_03_02_113849_create_permission_tables.php`
  - tablas de Spatie: `roles`, `permissions`, `model_has_roles`, etc.
- `2026_03_25_110000_rename_role_has_permissions_table.php`
  - renombra a `role_permissions`
- `2026_03_25_110010_add_is_active_to_roles_table.php`
  - agrega `is_active`
- `2026_03_25_113000_normalize_role_names.php`
  - normaliza nombres de roles
- `2026_03_25_113500_add_display_name_to_roles_table.php`
  - agrega nombre visible
- `2026_03_25_114000_backfill_role_display_names.php`
  - rellena nombres visibles

### Media y actividad

- `2026_03_02_134345_create_media_table.php`
  - tabla del paquete Media Library
- `2026_03_11_071847_create_activity_log_table.php`
  - tabla de activity log
- `2026_03_11_071848_add_event_column_to_activity_log_table.php`
- `2026_03_11_071849_add_batch_uuid_column_to_activity_log_table.php`

### Centros educativos

- `2026_03_05_130311_create_education_centers_table.php`
  - crea tabla principal
- `2026_03_12_113457_add_agreement_fields_to_education_centers_table.php`
  - fechas y plazas del convenio
- `2026_03_13_104347_add_contact_email_to_education_centers_table.php`
  - agrega email de contacto y backfill
- `2026_03_18_120500_add_internal_notes_to_education_centers_table.php`
  - notas internas

### Becarios

- `2026_03_10_102508_create_interns_table.php`
  - tabla central de becarios
- `2026_03_11_090048_add_total_hours_to_interns_table.php`
  - horas totales
- `2026_03_17_100201_add_abandoned_status_to_interns_table.php`
  - nuevo estado
- `2026_03_17_130000_align_intern_statuses_to_spec.php`
  - alinea estados
- `2026_03_18_120000_add_internal_notes_to_interns_table.php`
  - notas internas
- `2026_03_24_113636_add_tutor_fields_to_interns_table.php`
  - datos de tutor centro/empresa

### Tipos de practica y tareas

- `2026_03_19_092053_create_practice_types_table.php`
- `2026_03_19_092110_create_tasks_table.php`
- `2026_03_19_092153_create_task_comments_table.php`
- `2026_03_19_092211_create_task_status_logs_table.php`
- `2026_03_19_092233_create_intern_task_table.php`

Si lo piensas como profesor: las migraciones te cuentan el modelo de dominio del proyecto.

---

## 15. Carpeta `database/seeders/`

### `DatabaseSeeder.php`

Lanza los seeders principales:

- `RoleSeeder`
- `EducationCenterSeeder`
- `TutorSeeder`

### `RoleSeeder.php`

Crea permisos y roles base:

```php
Permission::firstOrCreate(['name' => 'manage schools']);
Permission::firstOrCreate(['name' => 'manage interns']);
```

Y asigna permisos al admin.

### `EducationCenterSeeder.php`

Crea 35 centros fake.

### `TutorSeeder.php`

Crea 10 tutores reales de ejemplo y les asigna rol `tutor`.

### `InternSeeder.php`

Crea 20 becarios fake.

Ojo: no aparece en `DatabaseSeeder`, asi que no se ejecuta automaticamente.

---

## 16. Carpeta `database/factories/`

Sirve para tests y seeders.

### `UserFactory.php`

Genera usuarios fake, con helpers:

- `unverified()`
- `withTwoFactor()`

### `EducationCenterFactory.php`

Genera centros fake.

### `InternFactory.php`

Genera becarios fake enlazando:

- un `User`
- un `EducationCenter`

---

## 17. Carpeta `resources/views/`

### `resources/views/app.blade.php`

Es la plantilla HTML raiz para Inertia.

Hace tres cosas importantes:

1. carga favicon y fuente
2. inyecta Vite
3. monta `@inertia`

Fragmento:

```blade
@vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
@inertiaHead
```

Tambien aplica tema oscuro antes del render para evitar parpadeos.

---

## 18. Carpeta `resources/css/`

### `resources/css/app.css`

Es tu capa visual global.

Contiene:

- import de Tailwind
- variables de color
- tema claro y oscuro
- clases de layout como `.page-shell`, `.page-surface`, `.page-title`

Ejemplo:

```css
.page-surface {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 1rem;
    padding: 1.5rem;
}
```

Esto hace que muchas paginas compartan un estilo consistente.

---

## 19. Carpeta `resources/js/`

Esta es tu aplicacion React.

### 19.1 Arranque

#### `resources/js/app.tsx`

Punto de entrada cliente.

```tsx
createInertiaApp({
    resolve: (name) =>
        resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
});
```

Hace:

- resolver paginas Inertia
- montar React
- mostrar `Toaster`
- inicializar tema

#### `resources/js/ssr.tsx`

Version para SSR.

---

### 19.2 Layouts

#### `layouts/app-layout.tsx`

Wrapper general del backend autenticado.

#### `layouts/app/app-sidebar-layout.tsx`

Es el layout real que usas mas:

- sidebar
- header superior con breadcrumbs
- contenido con `page-shell`

#### `layouts/app/app-header-layout.tsx`

Variante con header superior sin sidebar.

#### `layouts/auth-layout.tsx`

Wrapper general para login/registro/etc.

#### `layouts/auth/auth-simple-layout.tsx`

Layout visual del login y autenticacion.

#### `layouts/auth/auth-card-layout.tsx`

Variante auth en tarjeta.

#### `layouts/auth/auth-split-layout.tsx`

Variante auth partida en dos columnas.

#### `layouts/settings/layout.tsx`

Layout para ajustes:

- profile
- password
- 2FA
- appearance

---

### 19.3 Librerias auxiliares `lib/`

#### `lib/animations.ts`

Animaciones reutilizables para Framer Motion.

#### `lib/date-format.ts`

Funciones para formatear fechas en espanol:

- `formatDateEs`
- `formatDateTimeEs`

#### `lib/recent-label.ts`

Genera etiquetas tipo "Actualizado hoy".

#### `lib/roles.ts`

Transforma slugs de rol/permiso en etiquetas legibles.

#### `lib/utils.ts`

- `cn(...)`: fusion de clases Tailwind
- `toUrl(...)`: normaliza URLs de Inertia

---

### 19.4 Hooks

#### `hooks/use-appearance.tsx`

Gestion completa del tema claro/oscuro/sistema.

#### `hooks/use-clipboard.ts`

Copiar al portapapeles.

#### `hooks/use-current-url.ts`

Sabe si una ruta es la actual para marcar menus activos.

#### `hooks/use-initials.tsx`

Saca iniciales del nombre.

#### `hooks/use-mobile-navigation.ts`

Ayuda a limpiar navegacion movil.

#### `hooks/use-mobile.tsx`

Detecta si estas en breakpoint movil.

#### `hooks/use-toast.ts`

Sistema de notificaciones toast.

#### `hooks/use-two-factor-auth.ts`

Gestiona QR, clave secreta y recovery codes del 2FA.

---

### 19.5 Types

#### `types/auth.ts`

Tipos de usuario y auth.

#### `types/navigation.ts`

Tipos de breadcrumbs y nav items.

#### `types/roles.ts`

Tipos para roles y permisos.

#### `types/ui.ts`

Props base de layouts.

#### `types/global.d.ts`

Amplia tipos globales de Inertia.

#### `types/index.ts`

Reexporta todos los tipos.

#### `types/vite-env.d.ts`

Tipos del entorno Vite.

---

### 19.6 Componentes propios

#### Estructura general

Tu carpeta `components/` mezcla:

- componentes de negocio
- componentes de layout
- componentes de soporte
- wrappers UI genericos

#### `app-logo-icon.tsx` y `app-logo.tsx`

Logo de la app.

#### `app-shell.tsx`

Contenedor general de la aplicacion, con `FlashToaster`.

#### `app-sidebar.tsx`

Construye sidebar segun rol.

#### `app-sidebar-header.tsx`

Header superior con breadcrumb y trigger del sidebar.

#### `app-content.tsx`

Wrapper del contenido principal.

#### `app-header.tsx`

Header desktop/mobile con menu, logo, links y menu de usuario.

#### `breadcrumbs.tsx`

Renderiza breadcrumbs.

#### `heading.tsx`

Cabeceras reutilizables.

#### `text-link.tsx`

Link con estilo comun.

#### `input-error.tsx`

Muestra errores de formulario.

#### `alert-error.tsx`

Muestra lista de errores dentro de `Alert`.

#### `flash-toaster.tsx`

Convierte mensajes flash Laravel en toasts.

#### `user-info.tsx`

Avatar, nombre y opcionalmente email.

#### `user-menu-content.tsx`

Menu desplegable del usuario.

#### `appearance-tabs.tsx`

Selector de tema.

#### `delete-user.tsx`

Dialogo para borrar cuenta.

#### `two-factor-setup-modal.tsx`

Wizard de configuracion 2FA: QR, clave manual y codigo OTP.

#### `two-factor-recovery-codes.tsx`

Muestra y regenera recovery codes.

#### `common/SimpleTable.tsx`

Tabla reutilizable con soporte de ordenacion.

#### `common/RowMetaBadges.tsx`

Pone badges como "Actualizado hoy" o "Nota".

#### `interns/DeleteInternModal.tsx`

Modal de borrado de becarios.

#### `interns/StatusBadge.tsx`

Badge visual para estado `active/completed/abandoned`.

#### `practice-types/DeletePracticeTypeModal.tsx`

Modal de borrado de tipos de practica.

#### `schools/DeleteCenterModal.tsx`

Modal de borrado de centros.

#### `tasks/DeleteTaskModal.tsx`

Modal de borrado de tareas.

---

### 19.7 Sidebar por rol

#### `components/sidebar/index.ts`

Devuelve el sidebar segun rol.

#### `sidebar-admin.ts`

Menu admin:

- dashboard
- usuarios
- centros
- tareas
- tipos practica
- roles
- reportes

#### `sidebar-tutor.ts`

Menu tutor:

- dashboard
- centros
- becarios
- tareas
- evaluaciones
- reportes

#### `sidebar-intern.ts`

Menu becario:

- dashboard
- mi centro
- mis tareas
- evaluaciones
- asistencia

#### `sidebar-types.ts`

Tipos TS del sidebar.

---

### 19.8 `components/ui/`

Aqui tienes wrappers de UI reutilizables, la mayoria inspirados en shadcn/radix.

Archivos:

- `alert.tsx`
- `avatar.tsx`
- `badge.tsx`
- `breadcrumb.tsx`
- `button.tsx`
- `card.tsx`
- `checkbox.tsx`
- `collapsible.tsx`
- `date-picker.tsx`
- `dialog.tsx`
- `dropdown-menu.tsx`
- `icon.tsx`
- `input-otp.tsx`
- `input.tsx`
- `label.tsx`
- `navigation-menu.tsx`
- `placeholder-pattern.tsx`
- `select.tsx`
- `separator.tsx`
- `sheet.tsx`
- `sidebar.tsx`
- `skeleton.tsx`
- `spinner.tsx`
- `table.tsx`
- `tabs.tsx`
- `toast.tsx`
- `toaster.tsx`
- `toggle.tsx`
- `toggle-group.tsx`
- `tooltip.tsx`

Como profesor te diria: no hace falta memorizar cada uno ahora. Lo importante es entender el patron:

- encapsulan estilos
- reutilizan primitives de Radix
- evitan repetir clases Tailwind en cada pagina

Ejemplo mental:

- `button.tsx` = boton estilizado reutilizable
- `dialog.tsx` = modal base
- `select.tsx` = selector base
- `table.tsx` = tabla base

---

## 20. Carpeta `resources/js/pages/`

Aqui vive la interfaz de negocio real.

### `pages/welcome.tsx`

Landing publica de BecaGest.

Muestra:

- propuesta de valor
- botones a login/registro
- CTA a dashboard si ya estas autenticado

### `pages/dashboard.tsx`

Actualmente es un placeholder visual con `PlaceholderPattern`.

---

### 20.1 Autenticacion `pages/auth/`

#### `login.tsx`

Formulario de login con:

- email
- password
- remember me
- animaciones `framer-motion`

#### `register.tsx`

Formulario de registro.

#### `forgot-password.tsx`

Pide email para recuperar password.

#### `reset-password.tsx`

Cambia password con token.

#### `confirm-password.tsx`

Reconfirma password para acciones sensibles.

#### `verify-email.tsx`

Pantalla para verificar correo.

#### `two-factor-challenge.tsx`

Pantalla del codigo 2FA durante login.

---

### 20.2 Becarios `pages/interns/`

#### `interns/index.tsx`

Listado principal de becarios.

Incluye:

- filtros
- ordenacion
- exportacion
- notas internas
- enlaces ver/editar/borrar

#### `interns/Create.tsx`

Formulario muy completo para crear becario.

Se organiza por tabs:

- datos personales
- academicos
- documentos
- tutorizacion

#### `interns/Edit.tsx`

Version de edicion del formulario anterior.

#### `interns/Show.tsx`

Ficha detallada del becario:

- datos personales
- datos academicos
- documentos
- centro
- tutor empresa
- actividad historica

---

### 20.3 Centros `pages/schools/`

#### `schools/index.tsx`

Listado de centros.

Usa filtros, exportacion y acciones sobre centros.

#### `schools/Create.tsx`

Formulario de alta de centro.

#### `schools/Edit.tsx`

Formulario de edicion de centro.

#### `schools/Show.tsx`

Detalle del centro:

- datos del centro
- convenio
- becarios asociados
- filtros dentro del propio centro

---

### 20.4 Tipos de practica `pages/practice-types/`

#### `practice-types/index.tsx`

Listado de tipos de practica.

#### `practice-types/Create.tsx`

Alta de tipo: nombre, prioridad, descripcion, color, activo.

#### `practice-types/Edit.tsx`

Edicion de tipo.

---

### 20.5 Tareas `pages/tasks/`

#### `tasks/index.tsx`

Vista principal de tareas.

Tiene dos ideas fuertes:

- tabla
- kanban drag-and-drop con `@dnd-kit`

Estados del kanban:

```ts
const KANBAN_COLUMNS = [
    { key: 'pending', label: 'Pendiente' },
    { key: 'in_progress', label: 'En progreso' },
    { key: 'in_review', label: 'En revision' },
    { key: 'completed', label: 'Completada' },
    { key: 'rejected', label: 'Rechazada' },
];
```

#### `tasks/My.tsx`

Vista de "mis tareas" para becarios. Es una variacion de `index.tsx`.

#### `tasks/Create.tsx`

Formulario de creacion de tareas.

Soporta tres tipos de asignacion:

- usuario
- modulo
- centro

#### `tasks/Edit.tsx`

Edicion de tarea.

#### `tasks/Show.tsx`

Detalle de tarea:

- informacion principal
- becarios asignados
- comentarios
- adjuntos
- marcar como completada

---

### 20.6 Ajustes `pages/settings/`

#### `settings/profile.tsx`

Perfil del usuario.

#### `settings/password.tsx`

Cambio de password.

#### `settings/two-factor.tsx`

Pantalla de 2FA:

- activar
- confirmar
- desactivar
- mostrar recovery codes

#### `settings/appearance.tsx`

Cambio de tema visual.

---

### 20.7 Otras paginas

#### `pages/users/index.tsx`

Gestion de usuarios y cambio de rol.

#### `pages/roles/index.tsx`

Gestion completa de roles y permisos.

#### `pages/admin/index.tsx`

Placeholder de administradores.

#### `pages/tutors/index.tsx`

Placeholder de tutores.

#### `pages/attendance/index.tsx`

Placeholder control horario.

#### `pages/evaluations/index.tsx`

Placeholder evaluaciones.

#### `pages/reports/index.tsx`

Placeholder reportes.

---

## 21. Carpeta `resources/js/routes/`

Estos archivos estan generados automaticamente por Wayfinder.

Su funcion:

- evitar escribir URLs a mano
- generar helpers tipados para las rutas Laravel

Ejemplo de patron:

```ts
export const index = (): RouteDefinition<'get'> => ({
    url: '/becarios',
    method: 'get',
})
```

Carpetas/archivos importantes:

- `routes/index.ts`: login, logout, dashboard, register, home...
- `routes/becarios/index.ts`: helpers de becarios
- `routes/centros/index.ts`: helpers de centros web
- `routes/education-centers/index.ts`: helpers del API `/api/...`
- `routes/tasks/index.ts`
- `routes/roles/index.ts`
- `routes/users/index.ts`
- `routes/profile/index.ts`
- `routes/user-password/index.ts`
- `routes/two-factor/index.ts`
- `routes/appearance/index.ts`

Como profesor: no los edites a mano salvo que sepas que son fuente y no generados.

---

## 22. Carpeta `resources/js/actions/`

Tambien parecen generados automaticamente.

Representan acciones/controladores Laravel como helpers TS.

Ejemplos:

- `actions/App/...`
- `actions/Laravel/Fortify/...`
- `actions/Laravel/Sanctum/...`

Te permiten hacer cosas como:

- formularios contra Fortify
- acciones de logout
- confirmacion de password
- endpoints de 2FA

Si quieres una lectura simple:

- `routes/*` = enlaces a rutas
- `actions/*` = helpers de acciones/controladores

---

## 23. Carpeta `resources/js/wayfinder/`

### `wayfinder/index.ts`

Es la base tecnica que usan `routes/*` y `actions/*`.

Define:

- `RouteDefinition`
- `RouteFormDefinition`
- `queryParams(...)`
- `setUrlDefaults(...)`

Es el motor que construye URLs tipadas.

---

## 24. Carpeta `tests/`

Usas Pest.

### `tests/Pest.php`

Configura que los tests Feature usen:

- `Tests\TestCase`
- `RefreshDatabase`

### `tests/TestCase.php`

Base comun para tests.

### `tests/Feature/`

#### `DashboardTest.php`

Comprueba acceso al dashboard.

#### `ExampleTest.php`

Test simple de home.

#### `Auth/AuthenticationTest.php`

Login, logout, rate limit y 2FA redirect.

#### `Auth/EmailVerificationTest.php`

Verificacion de email.

#### `Auth/PasswordConfirmationTest.php`

Pantalla de confirmar password.

#### `Auth/PasswordResetTest.php`

Flujo de reset password.

#### `Auth/RegistrationTest.php`

Registro.

#### `Auth/TwoFactorChallengeTest.php`

Pantalla desafio 2FA.

#### `Auth/VerificationNotificationTest.php`

Envio del correo de verificacion.

#### `Settings/ProfileUpdateTest.php`

Actualizar perfil y borrar cuenta.

#### `Settings/PasswordUpdateTest.php`

Actualizar password.

#### `Settings/TwoFactorAuthenticationTest.php`

Pantalla 2FA y sus requisitos.

### `tests/Unit/ExampleTest.php`

Test unitario minimo.

---

## 25. Carpetas de almacenamiento y publicas

### `public/`

Archivos publicos:

- `index.php`: punto de entrada Laravel
- `favicon.*`
- `apple-touch-icon.png`
- `robots.txt`
- `images/becagest-logo.png`

### `storage/app/public`

Almacenamiento publico.

### `storage/app/private`

Almacenamiento privado.

### `storage/logs`

Logs de Laravel.

---

## 26. Resumen mental final

Si te preguntara en clase "como esta montado tu proyecto", una buena respuesta seria:

1. `routes/` define las URLs.
2. `app/Http/Controllers/` recibe la peticion y prepara datos.
3. `app/Models/` representa tablas y relaciones.
4. `app/Http/Requests/` valida formularios.
5. `database/migrations/` define la estructura de la BD.
6. `resources/js/pages/` pinta la interfaz real.
7. `resources/js/components/` reutiliza piezas de UI.
8. `resources/js/layouts/` da estructura visual.
9. `tests/` comprueba autenticacion y ajustes.

Y si te preguntara "cuales son los modulos de negocio reales del proyecto", diria:

- autenticacion
- usuarios y roles
- becarios
- centros educativos
- tipos de practica
- tareas
- notas, documentos y exportaciones

---

## 27. Cosas especialmente buenas que ya tienes

- Separacion clara entre backend y frontend.
- Validaciones movidas a `FormRequest`.
- Uso de `SoftDeletes`.
- Roles/permisos bien encaminados.
- Exportaciones Excel.
- Documentos adjuntos con Media Library.
- 2FA y auth bastante completos.

## 28. Cosas que yo revisaria como profesor contigo

- El typo `chenged_by` en `TaskStatusLog`.
- Algunos modulos aun son placeholders: `reports`, `attendance`, `evaluations`, `admin`, `tutors`.
- Parte del codigo generado (`routes/actions`) conviene no tocarlo manualmente.
- Hay bastante logica repetida entre `tasks/index.tsx` y `tasks/My.tsx`.

---

Si quieres, el siguiente paso natural es que te explique esta misma guia pero "de verdad como clase", empezando por el flujo completo de una accion concreta, por ejemplo:

- crear un becario de principio a fin
- iniciar sesion de principio a fin
- crear una tarea y verla en el kanban
- ver como se conectan rutas, controlador, modelo, pagina React y base de datos
