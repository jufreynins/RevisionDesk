# RevisionDesk

An internal website task and revision ticket management system for a web development team managing multiple client websites — create, assign, track, review, and complete revision requests, bug fixes, and content updates from one dashboard.

## Technology Stack

- **Backend:** Laravel 12 (PHP 8.2+), MySQL
- **Frontend:** React 18 + TypeScript, rendered through Inertia.js (no separate API/SPA build)
- **Styling:** Tailwind CSS 3, `@tailwindcss/forms`, `@tailwindcss/typography`
- **Rich text:** TipTap (headings, lists, links, tables, code blocks)
- **Icons:** Lucide
- **Charts:** Recharts (Reports)
- **Auth:** Laravel Breeze (react-ts stack) — session-based, no public registration
- **Authorization:** Laravel Policies (`app/Policies`) + route middleware, enforced server-side only

## Role Overview

| Role | Summary |
|---|---|
| **Administrator** | Full access — manages users, websites, tasks, statuses; can reopen and delete. |
| **Project Manager** | Manages their own websites and tasks on those websites; assigns work; approves/reopens. |
| **Developer** | Sees tasks assigned to them; updates status, logs time, comments, uploads files. |
| **Client** | Submits revision requests for their own tickets only; never sees internal notes or staff-only comments. |

## Installation

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

## Environment Setup

Edit `.env` and point it at a MySQL database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=revisiondesk
DB_USERNAME=root
DB_PASSWORD=
```

Default app timezone is `Asia/Manila` (`config/app.php`).

## Database Setup

Create the database, then run migrations and seed realistic demo data:

```bash
# create the database first, e.g.:
mysql -u root -e "CREATE DATABASE revisiondesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

php artisan migrate
php artisan db:seed
# or, to reset + seed in one step:
php artisan migrate:fresh --seed
```

### Default Local Test Accounts

All seeded accounts use the password **`password`**. These are placeholder credentials for local development only — never used in production.

| Role | Email |
|---|---|
| Administrator | `admin@revisiondesk.test` |
| Project Manager | `pm@revisiondesk.test` |
| Developer | `developer1@revisiondesk.test` (credential-view permission enabled) |
| Developer | `developer2@revisiondesk.test` |
| Developer | `developer3@revisiondesk.test` |
| Client | `client1@revisiondesk.test` |
| Client | `client2@revisiondesk.test` |

Seeded data also includes 5 demo websites (each with a placeholder credential) and 30 demo tasks with comments, checklists, time entries, attachment metadata, and activity history.

## Modules

Beyond core task/website management, the app includes:

- **Notifications** — in-app (bell icon + `/notifications`), optional email, gated by the `email_notifications_enabled` setting. Fires on assignment, reassignment, status changes, comments, review/approval/revision events. Never notifies the acting user or leaks internal-comment notifications to clients. A scheduled command (`app:send-task-due-date-notifications`, daily 08:00 — requires `php artisan schedule:work` or a cron entry) notifies assignees of tasks due tomorrow or newly overdue.
- **Activity Log** (`/activity-log`) — global feed of task activity, scoped server-side to what the viewer's role can see. Admin/PM only.
- **Team** (`/team`) — admin-only user management (create/edit/deactivate). Project managers can view the roster but not manage it.
- **Website Credentials** — stored encrypted, revealed only via a JSON endpoint (never through Inertia's page history) that logs every view to `credential_views`. Gated per-credential by `WebsiteCredentialPolicy`.
- **Settings** (`/settings`, admin-only) — company name/logo, task defaults, ticket prefix, file size limit, timezone/date format, email notification toggle.
- **Reports** (`/reports`, admin/PM only) — date-range filtered: tasks completed over time, open tasks per website, tasks by priority/type, overdue count, average completion time, tasks completed per team member, estimated vs. actual time.

## Development

Run the backend, queue worker, log viewer, and Vite dev server together:

```bash
composer run dev
```

Or individually:

```bash
php artisan serve
npm run dev
```

## Build (production assets)

```bash
npm run build
```

## Tests

```bash
php artisan test
```

Tests run against an in-memory SQLite database (configured in `phpunit.xml`) and cover authentication, role permissions, website creation, task creation/assignment/status transitions, internal vs. client-visible comments, task approval, task reopening, and website credential encryption/authorization.

## File Storage

Uploaded task/comment attachments are stored on the `local` disk (`storage/app/private` by default in Laravel 12 — **not** web-accessible) and served only through the authenticated, policy-checked download route (`GET /tasks/{task}/attachments/{attachment}/download`). Never point attachments at the `public` disk.

## Mail Configuration

`.env` defaults `MAIL_MAILER=log` for local development (emails are written to the log instead of sent). Configure standard Laravel mail env vars (`MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`) for real outbound email in staging/production.

## Deployment Notes

- Run `php artisan migrate --force` and `npm run build` as part of your deploy pipeline.
- Set `APP_ENV=production`, `APP_DEBUG=false`, and a real `APP_KEY`.
- Point `FILESYSTEM_DISK` and queue/cache drivers at real infrastructure (this project defaults to `database` for cache/queue/sessions, which is fine for a single-server deployment).
- Only administrators can create user accounts — there is no public registration route.

## Security Reminders

- Never commit a real `.env` file or real client credentials.
- Website credentials (`website_credentials` table) are encrypted at rest via Eloquent's `encrypted` cast and are `hidden` from array/JSON serialization; access is gated by `WebsiteCredentialPolicy` and every reveal is intended to be logged (`credential_views` table).
- All rich-text input (task descriptions, comments) is sanitized server-side (`App\Support\HtmlSanitizer`) before storage — never trust the WYSIWYG output as safe HTML.
- Authorization is enforced in Laravel Policies/Form Requests, not just in the React UI — client-side permission checks are for UX only.
