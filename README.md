# DMT Companion App

## Overview

DMT Companion App is a Next.js (TypeScript) web application that provides user authentication, CSV upload/processing, a simple dashboard, and utilities for managing companion data. The app specifically consumes telemetry CSV files exported by Team Telemetry 25 (F1 25) and visualizes race telemetry data in the web UI. It integrates with Supabase for authentication and data storage and includes scripts to seed development data.

This repository is part of a multi-project workspace and focuses on the frontend/web companion experience for Da Matta Racing Team, with first-class support for Team Telemetry 25 CSV exports.

## Features

- User authentication (login, change password)
- CSV upload and processing page
- Create and manage companion entries
- Per-item dashboard views
- Integration with Supabase (auth + database)
- Developer seed script to create test users

## Tech stack

- Next.js (app router) + TypeScript
- Supabase (Auth, Postgres)
- Tailwind / PostCSS (configured in project)
- Node.js for scripts and tooling

## Prerequisites

- Node.js 18 or newer
- npm, yarn, or pnpm
- Supabase project (for Auth and Database)

## Environment variables

Create a `.env.local` file in the project root with at least the following variables:

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the anon/public key for client usage
- `SUPABASE_SERVICE_ROLE_KEY` — (optional, for server-side privileged operations)
- `DATABASE_URL` — (if using direct DB connections from server code)

Example `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

Do not commit `.env.local` to version control.

## Installation

1. Install dependencies

```bash
npm install
# or
# yarn
# pnpm install
```

2. Add your environment variables in `.env.local` (see above)

3. (Optional) Seed development users and data

```bash
node scripts/seed-users.js
```

## Running the app

Start the development server:

```bash
npm run dev
# or
# yarn dev
# pnpm dev
```

Open http://localhost:3000 in your browser.

Build for production:

```bash
npm run build
npm run start
```

## Project structure (high level)

- `app/` — Next.js app routes and pages
	- `api/` — serverless API routes (auth endpoints)
	- pages like `login`, `dashboard`, `create`, `cargar-csv`
- `components/` — React components used by pages
- `lib/` — utilities and Supabase client (`supabase.ts`, `database.ts`)
- `services/` — business logic and CSV processor
- `scripts/` — utility scripts (e.g., `seed-users.js`)

## CSV upload & processing

The app includes a CSV upload page to ingest companion data. Specifically, it expects telemetry CSV exports from Team Telemetry 25 (F1 25). Uploaded telemetry CSVs are parsed and processed by the `services/csvProcessor.ts` module and stored/visualized in the dashboard. Modify `services/csvProcessor.ts` to adapt parsing rules, column mappings, or persistence logic for different CSV variants.

## Authentication

Authentication is handled by Supabase. The app uses the Supabase client in `lib/supabase.ts`. Server-side API routes use Supabase admin/service role keys when privileged operations are required.

## Deployment

This is a standard Next.js app and can be deployed to Vercel, Netlify (with adapter), or any platform supporting Node.js. Ensure environment variables are set in the target environment (Supabase keys, DB URL, etc.).

Recommended steps for deployment:

1. Build the app (`npm run build`).
2. Provide production env vars in the host control panel.
3. Run or let the platform run `npm start` or use the platform's Next.js integration.

## Contributing

Contributions are welcome. Typical workflow:

1. Fork the repository
2. Create a feature branch
3. Open a pull request with a clear description of changes

Please add tests or manual verification steps for non-trivial changes.

## Troubleshooting

- If authentication fails, verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct.
- If server routes need elevated DB permissions, ensure `SUPABASE_SERVICE_ROLE_KEY` is available to server code only.
- For CSV parsing issues, check `services/csvProcessor.ts` for parsing rules.

## License

This project follows the repository-level license.



