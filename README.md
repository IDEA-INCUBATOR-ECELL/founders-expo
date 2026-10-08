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

On first start, a unique organizer password is generated and saved to `.data/organizer-credentials.txt`. Use those credentials at `/#admin` (the existing `/#organizer` route also works). Each application opens a complete review with an **Accept & publish** action, status/stall controls, original uploads, and authenticated Markdown/PDF downloads. Idea, rapid-fire, feedback and team-introduction records also have full detail views and downloads. PDF exports use bundled DejaVu fonts, with their license in `server/fonts/`. The credentials and database are excluded from git. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before the first startup to provision your own credentials instead. These settings do not overwrite an existing user.

## Included flows

- Searchable startup showcase with category, stage, product availability, and hiring filters.
- Accessible startup detail dialogs, private structured feedback, and team introductions.
- Four-step application form with startup name, one-line idea, display choices (including a conditional Other response), mandatory startup logo, leader contact and college emails, team size with additional member contact fields, and stall requirements. Includes IndexedDB draft persistence, upload validation, review and unique reference/access codes.
- Private founder application tracking and feedback inbox at `/#status`.
- Separate original ideas and rapid-fire submissions. Organizers publish real NEC problem statements.
- Authenticated application review, approve/reject, internal notes, unique stall assignment, requirements review, and CSV export.
- Separate Supabase records for users, applications, public profiles, team members, products, requirements, feedback, ideas, rapid-fire entries, stall assignments, team interests, sessions, and problem statements.

Accepted startup cards show the uploaded logo, startup name, one-line idea and leader name. Details show the college, display plans, team and stall. Only approved public profiles are returned by the public API. Emails, phone numbers, private feedback, access codes, and organizer notes are excluded. Organizer passwords use scrypt; sessions use random tokens, stored hashed, with HttpOnly and SameSite cookies. Mutation requests validate origins. Exports neutralize leading spreadsheet formula characters.

## Content and hosting

The public showcase shows “Coming soon...” until an admin accepts and publishes an application, including when the database is unavailable. Background refreshes reveal approved startups automatically and preserve already loaded profiles during a temporary connection failure. Submission and admin pages still report errors when an action cannot be saved. Illustrative demo profiles are removed automatically on startup, and no demo records are seeded. Real submissions and approved startup profiles are preserved.

Deploy the Node server with Node 24+, HTTPS, Supabase connection variables and `COOKIE_SECURE=true`. Application records, sessions and uploads persist in Supabase. The `.data` directory is used only for local credentials and migration backups. See [sql/README.md](sql/README.md) for data protection and recovery details.

This project is built and tested locally; no public deployment or email delivery is configured. Production operations should add institution-managed account provisioning/recovery, backups, monitoring, and an event-specific retention policy. Founder access codes must be saved by the applicant; no automated email recovery is included.

## Vercel preview deployment

`vercel.json` selects `npm run build:preview` and the `dist` output directory. This explicit preview mode shows the “Coming soon...” showcase without demo ventures. Submissions and organizer access show an explanatory message; they never report false success. Local application drafts still save on the device.

The normal `npm run build` and `npm start` commands run the complete Express/Supabase application. The static preview does not host this API; deploy the Node backend separately for live submissions.
