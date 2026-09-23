# MGIT Startup & Innovation Expo

A responsive React application and Express/SQLite backend. The visual system follows `D:\Downloads\design (1).md`: ink surfaces, frosted glass, Sora / Plus Jakarta Sans / JetBrains Mono typography, and sky, periwinkle, mint, violet, and amber accents.

## Run

Requires Node.js 24 or newer.

```sh
npm install
npm run dev
```

Open http://localhost:5173. Vite and the API run on the same server.

```sh
npm run build
npm start
npm test
```

## Organizer access

On first start, a unique organizer password is generated and saved to `.data/organizer-credentials.txt`. Use those credentials at `/#organizer`. The credentials and database are excluded from git. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before the first startup to provision your own credentials instead. These settings do not overwrite an existing user.

## Included flows

- Searchable startup showcase with category, stage, product availability, and hiring filters.
- Accessible startup detail dialogs, private structured feedback, and team introductions.
- Nine-step application form with IndexedDB draft persistence (including uploaded images), image validation, full review, and unique reference/access codes.
- Private founder application tracking and feedback inbox at `/#status`.
- Separate original ideas and rapid-fire submissions. Organizers publish real NEC problem statements.
- Authenticated application review, approve/reject, internal notes, unique stall assignment, requirements review, and CSV export.
- Separate SQLite records for users, applications, public profiles, team members, products, requirements, feedback, ideas, rapid-fire entries, stall assignments, team interests, sessions, and problem statements.

Only approved public profiles are returned by the public API. Founder contact information, private feedback, access codes, and organizer notes are excluded. Organizer passwords use scrypt; sessions use random tokens, stored hashed, with HttpOnly and SameSite cookies. Mutation requests validate origins. Exports neutralize leading spreadsheet formula characters.

## Content and hosting

The initial six showcase ventures are clearly labeled illustrative demo content. Organizers can remove them from the Startups tab. Set `SEED_DEMO=false` on the first server run for an empty showcase. Event date is deliberately unannounced. Campus venue is shown as MGIT, Hyderabad; update with the specific event venue once confirmed. The supplied Idea Incubator MGIT × NEC 2026 collaboration logo is used in the header, About section, and footer. The supplied dark-background artwork is preserved and blended into the dark interface. The hero features an animated vector rocket, with reduced-motion support.

Deploy the Node server with a persistent disk, Node 24+, HTTPS, and `COOKIE_SECURE=true`. Set `PORT` if needed. `DATA_DIR` defaults to `.data` and contains the SQLite database; keep it private and back it up. Images are stored in the database, limited to PNG/JPEG/WebP, 2 MB per image and three product images. Local drafts may exceed device storage with many images; the interface reports when local saving fails. Submitted records remain persisted server-side.

This project is built and tested locally; no public deployment or email delivery is configured. Production operations should add institution-managed account provisioning/recovery, backups, monitoring, and an event-specific retention policy. Founder access codes must be saved by the applicant; no automated email recovery is included.

## Vercel preview deployment

`vercel.json` selects `npm run build:preview` and the `dist` output directory. This explicit preview mode bundles the six labeled demo ventures and supports startup discovery and detail views without a backend. Submissions and organizer access show an explanatory message; they never report false success. Local application drafts still save on the device.

The normal `npm run build` and `npm start` commands retain the complete Express/SQLite application. A full Vercel deployment still requires adapting the API and connecting persistent hosted storage.
