# MGIT Startup & Innovation Expo

A responsive React application with an Express backend and Supabase PostgreSQL storage. The visual system follows `D:\Downloads\design (1).md`: ink surfaces, frosted glass, Sora / Plus Jakarta Sans / JetBrains Mono typography, and sky, periwinkle, mint, violet, and amber accents.

## Run

Requires Node.js 24 or newer and a configured Supabase PostgreSQL connection. Follow [sql/README.md](sql/README.md) to create all tables, configure the new project and migrate the local SQLite records before the first launch.

```sh
npm install
npm run db:setup
npm run db:migrate
npm run db:check
npm run dev
```

Open http://localhost:5173. Without a configured database, the API pauses submissions; there is no SQLite fallback. See the SQL guide for environment variables and database tests.

```sh
npm run build
npm start
npm test
```

## Organizer access

Set ADMIN_EMAIL and ADMIN_PASSWORD before the first launch against an empty database. Existing accounts, including the migrated admin credentials, are preserved. Sign in at /#admin or /#organizer from any device using the same credentials. Accounts and sessions are stored in Supabase; the browser receives an HttpOnly secure session cookie on HTTPS. The backend does not write application data or generated passwords to local files. Each application has full review, Accept & publish, original uploads, and authenticated Markdown/PDF downloads.

## Included flows

- Searchable startup showcase with category, stage, product availability, and hiring filters.
- Accessible startup detail dialogs, private structured feedback, and team introductions.
- Four-step application form with startup name, one-line idea, display choices (including a conditional Other response), mandatory startup logo, leader contact and college emails, team size with additional member contact fields, and stall requirements. Includes upload validation, review and unique reference/access codes. The form is held only in page memory until submission; no drafts, receipts or submissions are written to localStorage or IndexedDB.
- Private founder application tracking and feedback inbox at `/#status`.
- Separate original ideas and rapid-fire submissions. Organizers publish real NEC problem statements.
- Authenticated application review, approve/reject, internal notes, unique stall assignment, requirements review, and CSV export.
- Separate Supabase records for users, applications, public profiles, team members, products, requirements, feedback, ideas, rapid-fire entries, stall assignments, team interests, sessions, and problem statements.

Accepted startup cards show the uploaded logo, startup name, one-line idea and leader name. Details show the college, display plans, team and stall. Only approved public profiles are returned by the public API. Emails, phone numbers, private feedback, access codes, and organizer notes are excluded. Organizer passwords use scrypt; sessions use random tokens, stored hashed, with HttpOnly and SameSite cookies. Mutation requests validate origins. Exports neutralize leading spreadsheet formula characters.

## Content and hosting

The public showcase shows “Coming soon...” until an admin accepts and publishes an application, including when the database is unavailable. Background refreshes reveal approved startups automatically and preserve already loaded profiles during a temporary connection failure. Submission and admin pages still report errors when an action cannot be saved. Illustrative demo profiles are removed automatically on startup, and no demo records are seeded. Real submissions and approved startup profiles are preserved.

Deploy the Node server with Node 24+, HTTPS, Supabase connection variables and `COOKIE_SECURE=true`. Application records, sessions and uploads persist in Supabase. Existing local files are retained only as migration sources, backups and private configuration. New application data goes to Supabase. See [sql/README.md](sql/README.md) for data protection and recovery details.

The repository is configured for live Vercel deployment. Email delivery is not configured. Production operations should add institution-managed account provisioning/recovery, backups, monitoring, and an event-specific retention policy. Founder access codes must be saved by the applicant; no automated email recovery is included.

## Live Vercel deployment

Vercel builds the live frontend using npm run build and serves /api/* through api/[...path].js. Both local development and Vercel use server/app.js. Set the production variables described in [VERCEL_ENV.md](VERCEL_ENV.md), then redeploy. /api/health must return HTTP 200 with ready: true and storage: supabase.

The private .env.vercel file is excluded from Git and deployment uploads. Node 24 is required. PDF fonts are included in the API bundle. The API performs no local filesystem writes. Logo and original-file links keep normal public/admin responses small; private files require an admin session. The complete submission request is limited to 4 MB for Vercel compatibility.

Unsubmitted form data lives only in the current page. Keep the page open until submission is confirmed, and save the reference and private tracking code yourself. Retry keys stay in page memory to avoid duplicate submissions after a temporary network failure; committed records and receipts are in Supabase.
