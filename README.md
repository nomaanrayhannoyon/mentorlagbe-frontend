# MentorLagbe — Frontend

A tuition and mentorship platform connecting students with verified tutors across Bangladesh. This repository contains the Next.js frontend **and** its API route handlers — the application is a full-stack Next.js deployment backed by MongoDB Atlas.

![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black)
![React](https://img.shields.io/badge/React-19.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![better-auth](https://img.shields.io/badge/auth-better--auth-green)

**Live website:** [https://mentorlagbe-server-beryl.vercel.app](https://mentorlagbe-server-beryl.vercel.app)

## Overview

MentorLagbe lets tutors publish tuition posts, lets students browse and apply for them, and gives administrators moderation and user-management tools. Authentication is handled by Better Auth with email/password and Google OAuth. Subscriptions are processed with Stripe Checkout, and images are hosted through ImgBB.

The UI is responsive and dark-mode aware, built with Tailwind CSS v4 and shadcn/ui components.

## Features

- **Role-based authentication** — student, tutor and admin accounts with server-side session verification
- **Google OAuth** — "Continue with Google" with account linking by verified email
- **Tuition discovery** — server-side search, subject/mode/class-level filters, price range, sorting and pagination
- **Tutor tools** — create, edit, delete, open and close tuition posts; review applicants
- **Student tools** — apply to tuitions, track application status, cancel pending applications, bookmark tuitions
- **Admin tools** — approve/reject tuitions with moderation notes, change user roles, review all applications and payments
- **Subscriptions** — Stripe Checkout for Pro Student and Pro Tutor plans, webhook-driven plan activation
- **Image uploads** — ImgBB hosting for tuition cover images and profile photos
- **Polished UX** — toasts, loading skeletons, branded 404 and error pages, responsive layouts

## Technologies & Packages

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.4.5 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| UI | React 19.3.1, Tailwind CSS v4, shadcn/ui (`@base-ui/react`), `lucide-react`, `cn` |
| Authentication | `better-auth` 1.7.26, `@better-auth/mongo-adapter`, JWT plugin |
| Database | MongoDB Atlas via the `mongodb` Node driver (v7) |
| Payments | `stripe` (server) and `@stripe/stripe-js` (client) |
| Image hosting | ImgBB (direct upload via `fetch`) |
| Validation | `zod` |
| Notifications | `sonner` |
| Theming | `next-themes` |
| Tooling | ESLint 9, Prettier 3, TypeScript, `tsx` |

## Authentication & User Roles

Better Auth is configured in `lib/auth.ts` and mounted at the single catch-all route `app/api/auth/[...all]/route.ts`. It uses the MongoDB adapter with `usePlural: true`, email/password (minimum 8 characters), a 7-day session, the JWT plugin, optional Google OAuth, and trusted origins derived from the environment.

| Role | Capabilities |
|------|--------------|
| **Student** | Browse and search tuitions, apply, track application status, cancel pending applications, bookmark tuitions, view own payments, buy Pro |
| **Tutor** | Post and manage tuitions, open/close posts, review applications, accept/reject applicants, upload images, buy Pro |
| **Admin** | Moderate tuitions (approve/reject), manage user roles, view all applications and payments |

Plans are `free` (default) or `pro`. Plan limits are enforced on the server: free tutors may publish up to 2 tuition posts, and free students may save up to 5 bookmarks. Pro has no limit. The `plan` field is only changed by the Stripe webhook — never by the client.

Route protection lives in `proxy.ts` (the Next.js 16 convention), which redirects anonymous visitors away from `/dashboard` and `/profile`. Pages and API handlers re-verify the session server-side via `lib/authHelper.ts` (`requireSession`, `requireRole`, `getApiSession`, `requireApiRole`, plus the named `verifyStudent` / `verifyTutor` / `verifyAdmin` guards).

## Tuition Browsing, Posting & Applications

- Public listings return only tuitions with `approvalStatus: "approved"` **and** `isActive: true`
- Search covers title, subject and description; filters include subject, mode, class level and price range
- New posts start as `pending` and become public only after admin approval
- Editing post content sends it back to `pending`; toggling `isActive` does not
- Students apply with phone number, preferred schedule and an optional note; duplicate applications are rejected
- Tutors accept or reject applications to their own tuitions; admins may act on any application
- Bookmarks are stored on the user document (`savedTuitions`), so no extra collection is introduced

## Subscriptions & Payments

Stripe Checkout sessions are created server-side in `app/api/payments/checkout/route.ts` for the caller's Pro tier. A `pending` payment record is written before redirecting to Stripe. The webhook at `app/api/payments/webhook/route.ts` verifies the Stripe signature and handles `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed` and `customer.subscription.deleted`. Only a confirmed webhook upgrades a user to `pro`; subscription deletion returns them to `free`. Payment features degrade gracefully when Stripe keys are absent.

## Image Upload

`POST /api/upload` accepts `multipart/form-data` with an `image` field (JPEG, PNG, WEBP or GIF, max 5 MB) and returns the ImgBB URL. It is used by the tuition form and the profile page.

## Database Architecture

Four domain collections are used. Bookmarks are a field on `users`, not a fifth collection.

| Collection | Key fields |
|------------|-----------|
| `users` | `name`, `email`, `emailVerified`, `role`, `plan`, `phone`, `bio`, `image`, `savedTuitions`, `createdAt` |
| `tuitions` | `title`, `description`, `subject`, `classLevel`, `mode`, `location`, `monthlyFee`, `daysPerWeek`, `bannerImage`, `tutorId`, `tutorName`, `tutorEmail`, `approvalStatus`, `isActive`, `moderationNote`, `createdAt`, `updatedAt` |
| `applications` | `tuitionId`, `tuitionTitle`, `subject`, `monthlyFee`, `tutorEmail`, `studentId`, `studentName`, `studentEmail`, `studentPhone`, `preferredSchedule`, `studentNote`, `status`, `appliedAt`, `updatedAt` |
| `payments` | `userId`, `userEmail`, `userName`, `userRole`, `planName`, `amount`, `currency`, `transactionId`, `stripeSessionId`, `paymentStatus`, `paidAt`, `createdAt` |

Enumerations: roles `student | tutor | admin`; plans `free | pro`; tuition approval `pending | approved | rejected`; tuition mode `Online | Offline`; application status `pending | accepted | rejected`; payment status `pending | paid | failed | refunded`.

Better Auth additionally manages the framework collections `sessions`, `accounts` and `verifications` (`usePlural: true`). Indexes are created automatically on first connection in `lib/db.ts`.

## Installation & Local Development

```bash
npm install
cp .env.example .env
# fill in the values in .env (secrets described below)
npm run dev
```

Open `http://localhost:3000`. Keep secrets in `.env` (not only `.env.local`): the seed script loads configuration via `dotenv/config`, which reads `.env`.

## Environment Variables

Names only — never commit their values. Full list with placeholders is in `.env.example`.

| Variable | Required | Purpose |
|----------|:--------:|---------|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string (`lib/db.ts` throws at startup if missing) |
| `MONGODB_DB` | No | Database name; defaults to `mentorlagbe` |
| `BETTER_AUTH_SECRET` | Yes | Signs sessions and auth state |
| `BETTER_AUTH_URL` | Yes | Public origin used as the auth base URL and OAuth callback origin |
| `CORS_ALLOWED_ORIGIN` | No | Allowed origin for API CORS headers and Better Auth trusted origins |
| `TRUSTED_ORIGINS` | No | Comma-separated additional trusted origins (falls back to `CORS_ALLOWED_ORIGIN`) |
| `GOOGLE_CLIENT_ID` | No | Enables Google OAuth |
| `GOOGLE_CLIENT_SECRET` | No | Enables Google OAuth |
| `IMGBB_API_KEY` | No | Enables image uploads |
| `STRIPE_SECRET_KEY` | No | Enables Stripe Checkout |
| `STRIPE_PRICE_PRO` | No | Fallback Stripe price ID |
| `STRIPE_PRICE_PRO_TUTOR` | No | Pro Tutor price ID |
| `STRIPE_PRICE_PRO_STUDENT` | No | Pro Student price ID |
| `STRIPE_WEBHOOK_SECRET` | No | Verifies Stripe webhook signatures |

All environment files are gitignored. Integration keys are optional: the corresponding features degrade gracefully instead of failing hard.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run `tsc --noEmit` |
| `npm run format` | Format `ts`/`tsx` files with Prettier |
| `npm run seed` | Seed demo users and tuitions (`scripts/seed.ts`) |

Additional database helpers are not npm scripts: `npx tsx scripts/verify-db.ts` (safe, prints collection counts) and `npx tsx scripts/cleanup-legacy.ts` (destructive — drops legacy collections; development only). Add UI primitives with `npx shadcn@latest add <component>`.

## Project Structure

```
app/
  (auth)/sign-in, sign-up     Authentication pages
  about, pricing              Marketing pages
  tuitions/[id]               Listing and detail pages
  dashboard/                  Role-gated dashboard shell and overview
    tuitions/new, [id]/edit   Tutor post editor
    applications, bookmarks, payments
    admin/tuitions, admin/users, admin/applications
  api/                        Route handlers
    auth/[...all], tuitions, applications, bookmarks
    payments, payments/checkout, payments/webhook
    admin/tuitions, admin/users, admin/payments, upload
  error, not-found            Error boundary, error route and branded 404
  forgot-password, reset-password, profile
components/
  dashboard/, tuitions/, payments/, ui/
lib/
  auth.ts, auth-client.ts, authHelper.ts
  collections.ts, types.ts, db.ts
  api.ts, api-client.ts, stripe.ts, imgbb.ts, plans.ts, utils.ts
scripts/
  seed.ts, verify-db.ts, cleanup-legacy.ts
proxy.ts                      Route protection (Next.js 16 "proxy" convention)
next.config.ts                Security and CORS headers
```

## Deployment

Deployed on Vercel. The build runs `npm run build`; the `proxy.ts` middleware runs on the Node.js runtime, so the host must support Node serverless functions. Set the environment variables in the Vercel project settings and redeploy after changes. Live site: [https://mentorlagbe-server-beryl.vercel.app](https://mentorlagbe-server-beryl.vercel.app).

## Repository

[github.com/nomaanrayhannoyon/mentorlagbe-frontend](https://github.com/nomaanrayhannoyon/mentorlagbe-frontend)
