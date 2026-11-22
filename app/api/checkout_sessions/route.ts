import { POST as canonicalPOST } from "@/app/api/payments/checkout/route"

/**
 * POST /api/checkout_sessions
 *
 * @deprecated Legacy alias retained so older clients keep working. It simply
 * delegates to the canonical Stripe Checkout handler at
 * /api/payments/checkout so there is exactly ONE implementation: same auth
 * (student/tutor), same Zod validation, same Stripe session creation, same
 * pending `payments` record, and the same `{ url, sessionId }` response shape.
 *
 * Prefer POST /api/payments/checkout in new code.
 */
export const POST = canonicalPOST
