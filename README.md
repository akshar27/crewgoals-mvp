# CrewGoals MVP

Production-minded MVP for a goal-based local group matching platform. The first use case is Beginner Run Crew in San Francisco: users onboard with goals, level, neighborhood, schedule, and vibe, then request to join small recurring groups.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- PostgreSQL, Prisma ORM, migrations and seed data
- Secure email/password auth with bcrypt password hashing and HTTP-only signed session cookies
- Zod validation on server-side mutations
- React Hook Form for auth forms
- Vitest unit tests for matching, capacity, duplicate joins, admin authorization, and feedback eligibility

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env values:

```bash
cp .env.example .env
```

Set:

- `DATABASE_URL`: PostgreSQL connection string
- `AUTH_SECRET`: at least 32 random characters
- `NEXT_PUBLIC_APP_URL`: local or deployed app URL

3. Create and seed the database:

```bash
npm run db:migrate
npm run db:seed
```

4. Run locally:

```bash
npm run dev
```

5. Run tests:

```bash
npm test
```

## Demo Accounts

- Admin: `admin@crewgoals.local`
- Admin password: `AdminPass123!`
- Sample user: `maya@example.com`
- Sample user password: `RunnerPass123!`

## Routes

- `/` landing page
- `/signup`, `/login`
- `/onboarding`
- `/dashboard`
- `/groups`, `/groups/[id]`
- `/events/[id]`
- `/feedback/[eventId]`
- `/settings/profile`
- `/admin`, `/admin/users`, `/admin/groups`, `/admin/events`, `/admin/feedback`

## Mobile App

The `mobile/` folder contains an Expo React Native app that runs on iPhone and Android from one codebase. It uses the Next.js app as its backend through `/api/mobile/*` JSON endpoints and stores the mobile auth token in Expo Secure Store.

Install mobile dependencies:

```bash
cd mobile
npm install
```

Set the API URL for your device:

```bash
cp .env.example .env
```

For iOS simulator, `EXPO_PUBLIC_API_URL=http://localhost:3000` works. For a real iPhone or Android device on the same Wi-Fi, use your computer's LAN URL, for example `http://10.0.0.230:3000`.

Run the backend first:

```bash
npm run dev
```

Then run the mobile app:

```bash
npm run mobile:start
```

You can also use:

```bash
npm run mobile:ios
npm run mobile:android
```

The mobile MVP includes login/signup, onboarding profile, dashboard recommendations, group browsing, join requests, upcoming events, and feedback-ready API support. Admin operations remain optimized for the web dashboard.

## Security And Reliability Notes

Passwords are hashed with bcrypt and never stored in plain text. Sessions are signed, HTTP-only cookies. Admin routes call `requireAdmin`, user routes call `requireUser`, and all mutations validate input with Zod. Group joins run in a transaction, prevent duplicate requests through a unique index, and reject full or closed groups. Feedback is limited to users marked `ATTENDED` for completed events.

The `services/matching.ts` recommendation function is intentionally separate from Prisma and UI code so it can be swapped for AI matching later.

## Deployment Notes

The recommended MVP deployment path is hosted PostgreSQL plus Vercel:

1. Create a hosted PostgreSQL database with Neon, Supabase, Railway, or another managed provider.

2. Copy the database connection string. Prefer a non-pooled/direct connection string for Prisma migrations if your provider gives you both pooled and direct URLs.

3. Add these environment variables in Vercel:

```bash
DATABASE_URL="postgresql://..."
AUTH_SECRET="generate-a-long-random-secret"
NEXT_PUBLIC_APP_URL="https://your-vercel-app.vercel.app"
```

Generate a local secret with:

```bash
openssl rand -base64 48
```

4. Deploy the Next.js backend/admin app. Vercel uses `vercel.json`, which runs:

```bash
npm run vercel-build
```

That command generates Prisma Client, runs `prisma migrate deploy`, and builds Next.js.

5. Seed production demo/admin data once:

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

The seed script is idempotent for demo goals, activities, groups, events, and users.

6. Update the mobile app API URL:

```bash
EXPO_PUBLIC_API_URL=https://your-vercel-app.vercel.app
```

Then restart Expo with a clean cache:

```bash
npm run mobile:start -- --clear
```

`AUTH_SECRET` and `DATABASE_URL` must stay server-only. Never expose them with a `NEXT_PUBLIC_` or `EXPO_PUBLIC_` prefix.
