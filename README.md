# CrewGoals MVP

Production-minded MVP for a goal-based local group matching platform. The first use case is Beginner Run Crew in San Francisco: users onboard with goals, level, neighborhood, schedule, and vibe, then request to join small recurring groups.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- PostgreSQL, Prisma ORM, migrations and seed data
- Secure email/password auth with bcrypt hashing and HTTP-only signed session cookies
- Password reset via single-use, hashed, time-limited tokens; transactional email (Resend, logged to `EmailLog`)
- Trust & safety: user reports + blocking, admin review queue
- Group engagement: members-only event comments, shareable invite links, event attendance
- Zod validation on every server-side mutation; rate limiting on auth endpoints
- React Hook Form for auth forms
- Vitest unit tests for matching, capacity, duplicate joins, admin auth, feedback eligibility, token validity, member access, and safety rules (22 tests)

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
- `RESEND_API_KEY` (optional): send real email. Without it, messages are still
  recorded in `EmailLog` and logged to the console — password reset works end
  to end in dev by copying the link from the logs.
- `EMAIL_FROM` (optional): defaults to `CrewGoals <onboarding@resend.dev>`

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
- `/signup`, `/login`, `/forgot-password`, `/reset-password`
- `/onboarding`
- `/dashboard`
- `/groups`, `/groups/[id]`
- `/events/[id]`
- `/feedback/[eventId]`
- `/invite/[token]` — group invite link landing
- `/settings/profile`
- `/terms`, `/privacy`
- `/admin`, `/admin/users`, `/admin/groups`, `/admin/events`, `/admin/events/[id]/attendance`, `/admin/feedback`, `/admin/reports`

## Mobile App

The `mobile/` folder is an Expo React Native app for iPhone and Android from one
codebase, talking to the Next.js app through `/api/mobile/*` JSON endpoints (auth
token in Expo Secure Store).

**Architecture:** `expo-router` file-based routing (`app/`), TanStack Query for
all data fetching + cache invalidation, and a layered `src/` (`api/`, `hooks/`,
`components/`, `theme`, `preference`, `rules`). Group **invite links deep-link
into the app** — `crewgoals://invite/<token>` and the `/invite/<token>` Vercel
URL both open `app/invite/[token].tsx`. `npm test` in `mobile/` runs the jest-expo
suite (api client, preference + rules helpers).

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

The mobile app covers login/signup, password reset, matching profile, dashboard
recommendations, group browsing + filters, join requests, invite links + deep
linking, event detail with comments, safety reporting / blocking, feedback, push
notifications, and alerts. Admin operations stay on the web dashboard.

Universal links (opening `https://…/invite/<token>` straight into the app) need
`apple-app-site-association` and `assetlinks.json` served from the web app once
the iOS Team ID and Android signing fingerprint are known from an EAS build. The
custom scheme and Android intent filter are already configured in `app.json`.

## Security And Reliability Notes

Passwords are hashed with bcrypt and never stored in plain text. Sessions are signed, HTTP-only cookies. Admin routes call `requireAdmin`, user routes call `requireUser`, and all mutations validate input with Zod. Group joins run in a transaction, prevent duplicate requests through a unique index, and reject full or closed groups. Feedback is limited to users marked `ATTENDED` for completed events.

Password reset tokens are random 32-byte values stored only as a SHA-256 hash, single-use, and expire after one hour; the forgot-password endpoint is rate limited and does not reveal whether an email exists. Event comments and invite-link creation are gated to accepted group members.

Pure business rules live in `services/` (`matching`, `group-rules`, `feedback-rules`, `tokens`, `member-access`, `safety-rules`), separate from Prisma and UI so they are unit-tested directly and can be swapped — e.g. `services/matching.ts` for an AI matcher later.

## Deployment Notes

### Quick path (Vercel CLI)

```bash
npm i -g vercel
vercel login
vercel link                                   # create/link the project
vercel env add DATABASE_URL production         # paste your Neon direct URL
vercel env add AUTH_SECRET production           # openssl rand -base64 48
vercel env add NEXT_PUBLIC_APP_URL production   # https://<project>.vercel.app
vercel --prod                                   # runs vercel-build (migrate deploy + next build)
DATABASE_URL="postgresql://..." npm run db:seed # once
```

Detailed walk-through:

1. Create a hosted PostgreSQL database with Neon, Supabase, Railway, or another managed provider.

2. Copy the database connection string. Prefer a non-pooled/direct connection string for Prisma migrations if your provider gives you both pooled and direct URLs.

3. Add these environment variables in Vercel:

```bash
DATABASE_URL="postgresql://..."        # required
AUTH_SECRET="generate-a-long-random-secret"   # required, >= 32 chars
NEXT_PUBLIC_APP_URL="https://your-vercel-app.vercel.app"   # required
RESEND_API_KEY="re_..."                # optional; without it, email is logged not sent
EMAIL_FROM="CrewGoals <you@yourdomain>" # optional
```

Generate the secret with:

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
