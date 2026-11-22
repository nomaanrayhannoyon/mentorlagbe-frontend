# MentorLagbe — Frontend / Backend API Contract

This document is the **single source of truth** for the shape of data exchanged
between the MentorLagbe backend (Next.js App Router route handlers) and the
frontend. It reflects the **actually implemented** backend, not aspirational
design.

- Canonical domain types live in `lib/collections.ts` (server, `ObjectId` ids).
- Client-safe mirrors live in `lib/types.ts` (`string` ids, `Date` as ISO `string`).
- If this document and the code ever disagree, **the code wins** — update this file.

---

## 1. Core enumerations

```ts
export type Role = "student" | "tutor" | "admin"

export type Plan = "free" | "pro"

/** Tuition moderation state. */
export type TuitionStatus = "pending" | "approved" | "rejected"

/** Tuition delivery mode. NOTE the exact casing: capitalised, hyphen-free. */
export type TuitionMode = "Online" | "Offline"

/** Application lifecycle. There is NO "withdrawn" status — students DELETE. */
export type ApplicationStatus = "pending" | "accepted" | "rejected"

/** Payment lifecycle. */
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"
```

### 1.1 `TuitionMode` — the one canonical definition

There is exactly **one** `TuitionMode` type, defined in `lib/collections.ts`
and re-exported by `lib/types.ts`:

```ts
type TuitionMode = "Online" | "Offline"
```

- Accepted values are `"Online"` and `"Offline"` (both capitalised).
- `"online"` / `"in-person"` are **invalid** and must not be sent to or
  expected from the API.
- When `mode === "Offline"`, `location` is **required**.
- When `mode === "Online"`, `location` should be omitted/empty.

> A previous static file `lib/tuitions.ts` defined a conflicting
> `TuitionMode = "online" | "in-person"`. It was dead code (zero imports) and
> has been removed to keep a single consistent definition.

---

## 2. Domain data structures

### 2.1 Tuition

```ts
export type Tuition = {
  _id: string                 // Mongo ObjectId, serialised as string
  title: string               // 3–120 chars
  description: string         // 20–2000 chars
  subject: string             // 2–80 chars
  classLevel: string          // e.g. "Class 9", "SSC", "HSC", "University"
  mode: TuitionMode           // "Online" | "Offline"
  location?: string           // required iff mode === "Offline", max 120 chars
  monthlyFee: number          // BDT per month, >= 0, <= 100000
  daysPerWeek?: number        // 1–7 (optional)
  bannerImage?: string        // ImgBB URL (optional)
  tutorId: string             // owner's user id
  tutorName?: string          // denormalised for display
  tutorEmail?: string         // denormalised for display
  approvalStatus: TuitionStatus
  isActive: boolean           // tutor can open/close for new applications
  moderationNote?: string     // admin note when rejecting
  createdAt: string           // ISO 8601 (server type: Date)
  updatedAt: string           // ISO 8601 (server type: Date)
}
```

**Field mapping reference (old → canonical).** These legacy names must NOT be
used with the API:

| Legacy name | Canonical name |
|-------------|----------------|
| `status`    | `approvalStatus` |
| `level`     | `classLevel` |
| `price`     | `monthlyFee` |
| `image`     | `bannerImage` |
| `schedule` (free text) | `daysPerWeek` (number 1–7) |

### 2.2 Application

```ts
export type Application = {
  _id: string
  tuitionId: string
  /** Denormalised tuition summary written at application time (immutable). */
  tuitionTitle: string
  subject: string
  monthlyFee: number
  tutorEmail: string
  studentId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  preferredSchedule?: string  // free text, e.g. "Weekday evenings"
  studentNote?: string        // optional message to the tutor
  status: ApplicationStatus   // "pending" | "accepted" | "rejected"
  appliedAt: string           // ISO 8601 (server type: Date)
  updatedAt: string           // ISO 8601 (server type: Date)
}
```

Notes:
- There is **no** `tuition` sub-object, no `message` field, no `createdAt`,
  and no `"withdrawn"` status. Use `tuitionTitle` / `subject` / `monthlyFee`,
  `studentNote`, and `appliedAt` instead.
- A student "cancels" a pending application via `DELETE /api/applications/[id]`
  (the row is removed), not by setting a status.

### 2.3 Payment

```ts
export type Payment = {
  _id: string
  userId: string
  userEmail: string
  userName: string
  userRole: Role
  planName?: string           // e.g. "Pro Tutor", "Pro Student"
  amount: number              // major units (e.g. dollars), filled by webhook
  currency: string            // e.g. "usd"
  transactionId?: string      // Stripe payment_intent / subscription / session id
  stripeSessionId?: string
  paymentStatus: PaymentStatus
  paidAt?: string             // ISO 8601
  createdAt: string           // ISO 8601
}
```

Notes:
- Use `planName` (not `plan`) and `paymentStatus` (not `status`).
- `amount` is `0` while `paymentStatus === "pending"`; the webhook fills it.

### 2.4 User / Session user

```ts
export type UserProfile = {
  _id: string
  name: string
  email: string
  emailVerified: boolean
  role: Role
  plan: Plan                   // "free" (default) | "pro"
  phone?: string
  bio?: string
  image?: string | null
  savedTuitions?: string[]     // bookmarked tuition ids (no 5th collection)
  createdAt?: string
}
```

---

## 3. User roles & authorization

| Role | Capabilities |
|------|--------------|
| `student` | Browse/search tuitions, apply, track own applications, cancel own pending application, bookmark tuitions (free: max 5), view own payments, buy Pro |
| `tutor` | Post/edit/delete **own** tuitions, open/close own tuitions, review applications to **own** tuitions (accept/reject), upload images, buy Pro (free: max 2 tuition posts) |
| `admin` | Approve/reject any tuition (moderation queue), change any user's role, view all payments + revenue stats, review any application, delete any tuition/application |

- `plan` is **never** set by the client. It starts as `"free"` and is only
  changed to `"pro"`/`"free"` by the Stripe webhook.
- `role` defaults to `"student"`. It can be provided at sign-up
  (`?role=tutor`) or changed by an admin.
- Plan limits are enforced **server-side** (`lib/plans.ts`):
  - free tutor → max 2 tuition posts
  - free student → max 5 bookmarks
  - pro → unlimited

---

## 4. Authentication

Auth is handled by **better-auth** and mounted at a single catch-all route:

```
app/api/auth/[...all]/route.ts   →  toNextJsHandler(auth)
```

### 4.1 Client usage (`lib/auth-client.ts`)

```ts
import { signIn, signUp, signOut, useSession, getSession } from "@/lib/auth-client"
```

### 4.2 Endpoints (provided by better-auth)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/sign-up/email` | Email + password registration |
| POST | `/api/auth/sign-in/email` | Email + password login |
| POST | `/api/auth/sign-in/social` | OAuth sign-in (provider = `google`, when configured) |
| POST | `/api/auth/sign-out` | Clear session |
| GET  | `/api/auth/get-session` | Current session/user |
| GET  | `/api/auth/callback/google` | Google OAuth callback (when configured) |

### 4.3 Session & security model

- Session token is stored in an httpOnly cookie (`better-auth.session_token`),
  signed/verified server-side. A JWT plugin is also enabled.
- All private API routes verify the session server-side via
  `verifyToken()` (`lib/authHelper.ts`) — **never** trust a client-sent role.
- Route protection for pages lives in `proxy.ts` (Next 16 convention; the
  exported function must be named `proxy`).
- Server helpers:
  - Pages/components: `requireSession()`, `requireRole(...)`
  - API routes: `getApiSession()`, `requireApiRole(...)`,
    and named guards `verifyStudent` / `verifyTutor` / `verifyAdmin`
- Auth failures return `401` (`Unauthenticated`); role failures return `403`
  (`Forbidden: requires one of [...]`).

---

## 5. Standard response conventions

### 5.1 Success
- Single resource: the resource object directly.
  `GET /api/tuitions/[id]` → `Tuition`
- Collections: `{ items: T[] }` (some add `total`/`page`/`limit`/`totalPages`).
- Mutations: `{ ok: true, ... }` or `{ insertedId, <resource> }`.

### 5.2 Errors
All errors use this shape (from `lib/api.ts` `jsonError`):

```ts
{ error: string, details?: unknown }
```

- `details` is present for Zod validation failures (HTTP `422`).
- Common statuses: `400` invalid input, `401` unauthenticated, `403` forbidden /
  plan limit, `404` not found, `409` duplicate, `413`/`415` upload issues,
  `422` validation failed, `500` server error, `503` feature not configured
  (Stripe/ImgBB/Google keys missing).

### 5.3 Plan-limit error (HTTP 403)

```ts
{ error: string, code: "PLAN_LIMIT_REACHED", limit: number }
```

---

## 6. API endpoints

> All request/response bodies are JSON unless noted. Auth column: **public**,
> **auth** (any signed-in user), or a specific role.

### 6.1 Tuitions

| Method | Path | Auth | Request body | Success response |
|--------|------|------|--------------|------------------|
| GET | `/api/tuitions` | public | — (query params below) | `{ items: Tuition[], page, limit, total, totalPages }` |
| GET | `/api/tuitions/[id]` | public¹ | — | `Tuition` |
| GET | `/api/tuitions/mine` | tutor | — | `{ items: Tuition[] }` (own, any status) |
| POST | `/api/tuitions` | tutor | create body² | `{ insertedId: string, tuition: Tuition }` (201) |
| PATCH | `/api/tuitions/[id]` | tutor (owner) | update body³ | `Tuition` (updated) |
| DELETE | `/api/tuitions/[id]` | tutor (owner) / admin | — | `{ ok: true }` |

¹ Non-approved tuitions are only visible to the owner tutor or an admin.
² **Create body** (Zod `createSchema`):
```ts
{
  title: string          // 3–120
  description: string    // 20–2000
  subject: string        // 2–80
  classLevel: string     // 1–80
  mode: "Online" | "Offline"
  location?: string      // required when mode === "Offline", max 120
  monthlyFee: number     // 0–100000
  daysPerWeek?: number   // 1–7
  bannerImage?: string   // URL or ""
}
```
³ **Update body** (Zod `updateSchema`) — every field optional:
```ts
{
  title?, description?, subject?, classLevel?,
  mode?: "Online" | "Offline",
  location?, monthlyFee?, daysPerWeek?, bannerImage?,
  isActive?: boolean      // open/close; does NOT trigger re-moderation
}
```
> Content edits (anything except a bare `isActive` toggle) reset
> `approvalStatus` to `"pending"` and clear `moderationNote`.

**`GET /api/tuitions` query params:**

| Param | Type | Notes |
|-------|------|-------|
| `q` | string | substring over title/subject/description (max 120) |
| `subject` | string | exact match |
| `mode` | `"Online" \| "Offline"` | |
| `classLevel` | string | exact match |
| `minPrice` / `maxPrice` | number | filter `monthlyFee` |
| `sort` | `price_asc` \| `price_desc` \| `newest` \| `oldest` | default `newest` |
| `page` | number ≥ 1 | default 1 |
| `limit` | number 1–50 | default 12 |

Only `approvalStatus === "approved"` **and** `isActive === true` tuitions are
returned by the public list.

### 6.2 Applications

| Method | Path | Auth | Request body | Success response |
|--------|------|------|--------------|------------------|
| GET | `/api/applications` | auth⁴ | — | `{ items: Application[] }` |
| POST | `/api/applications` | student | create body⁵ | `{ insertedId, application }` (201) |
| PATCH | `/api/applications/[id]` | tutor (own tuition) / admin | `{ action: "accept" \| "reject" }` | `Application` (updated) |
| DELETE | `/api/applications/[id]` | student (own) / admin | — | `{ ok: true }` |

⁴ Students → own; tutors → applications to own tuitions; admins → all.
⁵ **Create body** (Zod `createSchema`):
```ts
{
  tuitionId: string          // required
  studentPhone: string       // 7–30 chars
  preferredSchedule: string  // 3–160 chars
  studentNote?: string       // ≤ 2000, defaults ""
}
```
> Duplicate application (same student + tuition) → `409`.
> Applying to your own tuition → `400`.
> Tuition must be `approvalStatus === "approved"` → else `404`.
> DELETE on a non-pending application (student) → `400`.

### 6.3 Bookmarks (stored on `users.savedTuitions`)

| Method | Path | Auth | Request body | Success response |
|--------|------|------|--------------|------------------|
| GET | `/api/bookmarks` | auth | — | `{ items: {tuitionId}[], tuitionIds: string[], plan, limit }` |
| POST | `/api/bookmarks` | auth | `{ tuitionId: string }` | `{ ok, saved: true, count }` (201); `{ ok, alreadySaved: true }` if dup |
| DELETE | `/api/bookmarks/[id]` | auth | — (`id` = tuitionId) | `{ ok: true }` |

> Free students are capped at 5 bookmarks (server-enforced); exceeding → `403`
> `PLAN_LIMIT_REACHED`.

### 6.4 Payments

| Method | Path | Auth | Request body | Success response |
|--------|------|------|--------------|------------------|
| GET | `/api/payments` | auth | — | `{ items: Payment[] }` (own) |
| POST | `/api/payments/checkout` | student / tutor | `{ plan: "pro" }` | `{ url: string, sessionId: string }` |
| POST | `/api/payments/webhook` | Stripe (signature) | raw Stripe event | `{ received: true }` |
| GET | `/api/admin/payments` | admin | — | `{ items: Payment[], stats }` |
| POST | `/api/checkout_sessions` | student / tutor | `{ plan: "pro" }` | **deprecated alias** → same as `/api/payments/checkout` |

**`POST /api/payments/checkout`** creates a Stripe Checkout Session for the
caller's Pro tier (Pro Tutor / Pro Student by role), inserts a `pending`
`Payment` row, and returns the hosted URL. When Stripe is not configured it
returns `503` with a clear message so the UI can disable the upgrade button.

**`stats` shape** (`GET /api/admin/payments`):
```ts
{
  items: Payment[],
  stats: {
    totalPayments: number,
    paidCount: number,
    pendingCount: number,
    failedCount: number,
    totalRevenue: number,             // sum of paid amounts, 2dp
    revenueByPlan: Record<string, number>   // keyed by planName
  }
}
```

**Webhook events handled:** `checkout.session.completed`,
`checkout.session.async_payment_succeeded`,
`checkout.session.async_payment_failed`, `customer.subscription.deleted`.
Success sets `users.plan = "pro"`; subscription deletion sets it back to `"free"`.

### 6.5 Admin

| Method | Path | Auth | Request body | Success response |
|--------|------|------|--------------|------------------|
| GET | `/api/admin/tuitions` | admin | — (`?approvalStatus=pending\|approved\|rejected`, `status` alias) | `{ items: Tuition[] }` (all if no filter) |
| POST | `/api/admin/tuitions/[id]/review` | admin | `{ approvalStatus: "approved" \| "rejected", moderationNote?: string }` | `Tuition` (updated) |
| GET | `/api/admin/users` | admin | — | `{ users: UserProfile[] }` (no password fields) |
| PATCH | `/api/admin/users` | admin | `{ userId: string, role: Role }` | `{ ok: true, role }` |

> An admin cannot remove their own admin role (`400`).

### 6.6 Uploads (ImgBB)

| Method | Path | Auth | Body | Success response |
|--------|------|------|------|------------------|
| POST | `/api/upload` | auth | `multipart/form-data`, field `image` | `{ url: string }` |

Limits: max 5 MB; types `image/jpeg|png|webp|gif`. When ImgBB is not
configured → `503`.

---

## 7. Quick integration checklist for the frontend

- Use the types from **`lib/types.ts`** (string ids) in client components;
  never import `lib/collections.ts` into client code (it pulls in the Mongo driver).
- Tuition fields: `classLevel`, `monthlyFee`, `bannerImage`, `daysPerWeek`,
  `approvalStatus`, `mode: "Online" | "Offline"`. Do **not** use
  `level`/`price`/`image`/`schedule`/`status`.
- Application fields: `tuitionTitle`, `subject`, `monthlyFee`, `studentNote`,
  `appliedAt`, `status` (`pending|accepted|rejected` only). Cancel = `DELETE`,
  there is no `withdrawn`.
- Payment fields: `planName`, `paymentStatus`, `amount`, `createdAt`.
- All mutating requests should go through `apiFetch` (`lib/api-client.ts`),
  which sends cookies and throws `ApiError` with the server `error` message.
- Plan-limit failures surface as `403` with `code: "PLAN_LIMIT_REACHED"`.
- Missing Stripe/ImgBB/Google keys degrade gracefully to `503`/disabled UI —
  do not treat them as hard failures.