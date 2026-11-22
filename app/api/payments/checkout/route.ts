import { NextResponse } from "next/server"
import { z } from "zod"
import {
  getCollection,
  Collections,
  type Payment,
} from "@/lib/collections"
import { getStripe, PRICE_IDS, STRIPE_ENABLED } from "@/lib/stripe"
import { requireApiRole } from "@/lib/authHelper"
import { jsonError } from "@/lib/api"

/**
 * POST /api/payments/checkout
 *
 * Creates a Stripe Checkout Session for the Pro plan. Returns the hosted
 * checkout URL. When Stripe is not configured, responds 503 with a clear
 * message so the UI can disable the upgrade button.
 */
const checkoutSchema = z.object({
  plan: z.literal("pro"),
})

export async function POST(request: Request) {
  const auth = await requireApiRole(["student", "tutor"])
  if (!auth.ok) return jsonError(auth.error, auth.status)

  if (!STRIPE_ENABLED) {
    return jsonError(
      "Payments are not configured yet. The administrator must set STRIPE_SECRET_KEY.",
      503
    )
  }

  const stripe = getStripe()
  if (!stripe) return jsonError("Stripe not configured", 503)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError("Invalid JSON body")
  }
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError("Validation failed", 422, parsed.error.flatten())
  }

  if (!PRICE_IDS.pro) {
    return jsonError("Stripe price id not configured (STRIPE_PRICE_PRO)", 503)
  }

  const origin =
    process.env.BETTER_AUTH_URL ?? new URL(request.url).origin

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: PRICE_IDS.pro, quantity: 1 }],
    customer_email: auth.session.user.email,
    client_reference_id: auth.session.user.id,
    metadata: {
      userId: auth.session.user.id,
      plan: "pro",
    },
    success_url: `${origin}/dashboard?checkout=success`,
    cancel_url: `${origin}/pricing?checkout=cancelled`,
  })

  // Record a pending payment row so the webhook can reconcile it.
  const col = await getCollection<Payment>(Collections.payments)
  await col.insertOne({
    tuitionId: undefined,
    userId: auth.session.user.id,
    stripeSessionId: session.id,
    amount: 0, // filled in by the webhook from the subscription
    currency: "usd",
    status: "pending",
    plan: "pro",
    createdAt: new Date(),
  } as Payment)

  return NextResponse.json({ url: session.url, sessionId: session.id })
}