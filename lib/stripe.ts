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

/** Public price ids for plans, configured via env. */
export const PRICE_IDS = {
  pro: process.env.STRIPE_PRICE_PRO ?? "",
} as const
