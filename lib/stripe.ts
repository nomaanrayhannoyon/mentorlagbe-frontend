import Stripe from "stripe"

/**
 * Stripe client.
 *
 * Stripe is only initialised when STRIPE_SECRET_KEY is present, so the app
 * builds and runs without keys (payment features stay disabled). When the
 * key is absent, `getStripe()` returns null and route handlers respond with
 * a clear 503 instead of throwing.
 */

let stripe: Stripe | null = null

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (stripe) return stripe
  stripe = new Stripe(key)
  return stripe
}

export const STRIPE_ENABLED = Boolean(process.env.STRIPE_SECRET_KEY)

/**
 * Public price ids for the two Pro tiers, configured via env:
 *
 *   STRIPE_PRICE_PRO_TUTOR   — Pro Tutor plan, $15/month
 *   STRIPE_PRICE_PRO_STUDENT — Pro Student plan, $10/month
 *
 * STRIPE_PRICE_PRO is kept as a single-price fallback so the app still
 * works when only one price id has been created in the Stripe dashboard.
 */
export const PRICE_IDS = {
  tutor:
    process.env.STRIPE_PRICE_PRO_TUTOR ?? process.env.STRIPE_PRICE_PRO ?? "",
  student:
    process.env.STRIPE_PRICE_PRO_STUDENT ?? process.env.STRIPE_PRICE_PRO ?? "",
} as const

/** Price id for a given role's Pro tier (null when unconfigured). */
export function priceIdForRole(role: "student" | "tutor"): string {
  return role === "tutor" ? PRICE_IDS.tutor : PRICE_IDS.student
}
