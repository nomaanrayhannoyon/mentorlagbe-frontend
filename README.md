# MentorLagbe

A tuition and mentorship platform connecting students with verified tutors across Bangladesh. Built with Next.js 16 (App Router), better-auth, MongoDB, Stripe, and ImgBB.

## Features

- **Role-based auth** (student / tutor / admin) via better-auth with JWT + session cookies
- **Tutor dashboard**: post, edit, delete tuitions with ImgBB image uploads; review applications; accept/reject students
- **Student dashboard**: browse/search/filter tuitions, apply, track applications, save bookmarks, view payments
- **Admin dashboard**: moderation queue (approve/reject with notes), user role management
- **Server-side search & filtering** with pagination on `/tuitions`
- **Stripe Checkout** for Pro membership (test mode until keys are added)
- **ImgBB** image hosting for tuition cover photos
- **Responsive, dark-mode-aware UI** built on shadcn/ui (base-nova) + Tailwind v4
- **Toast notifications**, loading skeletons, error boundaries, branded 404

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.4.5 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Auth | better-auth 1.7 (email+password, Google OAuth, JWT plugin) |
| DB | MongoDB Atlas (driver `mongodb` 7) |
| Payments | Stripe Checkout + webhooks |
| Image hosting | ImgBB |
| Validation | zod |
| UI | Tailwind v4 + shadcn/ui (`@base-ui/react`) + sonner (toasts) |
| Styling | CSS variables in `app/globals.css` (burgundy palette) |

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

Required:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (db `mentorlagbe`) |
| `BETTER_AUTH_SECRET` | 32+ char random secret for session signing |
| `BETTER_AUTH_URL` | Base URL, e.g. `http://localhost:3000` |

Optional (features degrade gracefully when absent):

| Variable | Description |
|---|---|
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Enables Google sign-in |
| `IMGBB_API_KEY` | Enables tuition image uploads |
| `STRIPE_SECRET_KEY` | Enables Stripe Checkout |
| `STRIPE_PRICE_PRO` | Stripe price id for the Pro plan |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

### 3. Seed the database (optional)

Creates an admin, two tutors, two students, and sample tuitions:

```bash
npm run seed
```

Seeded accounts (password `Password123!`):

- `admin1@example.com` — admin
- `tutora@example.com` / `tutorb@example.com` — tutors
- `studentx@example.com` / `studenty@example.com` — students

### 4. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000.

## Database

Four domain collections (plus an auxiliary `bookmarks` collection):

| Collection | Purpose |
|---|---|
| `user` | better-auth managed; `role` field drives RBAC |
| `tuitions` | Tutor posts; `status` = pending/approved/rejected |
| `applications` | Student → tuition; status = pending/accepted/rejected/withdrawn |
| `payments` | Stripe checkout records; status = pending/paid/failed/refunded |

Indexes (email uniqueness, tuition tutorId/status/subject, application tuitionId+studentId uniqueness, payment userId) are created automatically on first connection in `lib/db.ts`.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier (no semicolons, double quotes, LF) |
| `npm run seed` | Seed demo data |

## Project structure

```
app/
  (auth)/sign-in, sign-up       Auth pages
  about, pricing                Marketing pages
  tuitions/                     Listing + [id] detail
  dashboard/                    Role-gated dashboard (layout + pages)
    tuitions/new, [id]/edit     Tutor post/edit
    applications, bookmarks, payments
    admin/tuitions, admin/users Admin moderation + users
  api/                          Route handlers
    tuitions, tuitions/[id], tuitions/mine
    applications, applications/[id]
    admin/tuitions, admin/tuitions/[id]/review, admin/users
    payments, payments/checkout, payments/webhook
    bookmarks, bookmarks/[id]
    upload
    auth/[...all]               better-auth catch-all
  forgot-password, reset-password
  profile
components/
  dashboard/                    Dashboard-specific components
  tuitions/                     Listing + apply button
  payments/                     Checkout button
  ui/                           shadcn/ui primitives (base-nova)
lib/
  auth.ts                       better-auth server config
  auth-client.ts                better-auth React client
  authHelper.ts                 getSession/requireSession/requireRole + API guards
  collections.ts                Domain types + getCollection
  db.ts                         Shared Mongo client + indexes
  api.ts / api-client.ts        Validation helpers + fetch wrapper
  stripe.ts / imgbb.ts          External service clients
  types.ts                      Client-safe type mirrors
middleware -> proxy.ts          Route protection (Next 16 proxy convention)
scripts/seed.ts                 Demo data seeder
```

## Deployment

Deploy to Vercel (or any Node host). Steps:

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add all environment variables from `.env.example` in the Vercel dashboard.
4. For Stripe webhooks, set the webhook URL to `https://<your-domain>/api/payments/webhook` and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
5. Deploy. The build runs `npm run build` automatically.

> **Note:** `proxy.ts` runs on the Node.js runtime (Next 16), so the deployment must support Node.js serverless functions (Vercel does).

## Security notes

- `.env*` is gitignored. **If you committed secrets previously, rotate them and purge history** — the current `.env` contains a live Atlas admin password and `BETTER_AUTH_SECRET`.
- Passwords are hashed by better-auth; the `user` collection never stores plaintext.
- All `/api` routes re-verify the session server-side via `requireSession` / `requireApiRole`.
- Stripe webhooks verify the `stripe-signature` header.
- Email changes require verification (`updateEmailWithoutVerification: false`).
- Admins cannot demote themselves (prevents lockout).

## Verification

```bash
npm run format && npm run lint && npm run typecheck && npm run build
```

All four must pass before deploying. There is no test runner configured.