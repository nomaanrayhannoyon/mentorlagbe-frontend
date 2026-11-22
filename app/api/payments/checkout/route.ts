import { NextResponse } from "next/server"
import { z } from "zod"
import { getCollection, Collections, type Payment } from "@/lib/collections"
import { getStripe, priceIdForRole, STRIPE_ENABLED } from "@/lib/stripe"
import { requireApiRole } from "@/lib/authHelper"
import { jsonError } from "@/lib/api"

/**
 * POST /api/payments/checkout
 *
 * Creates a Stripe Checkout Session for the user's Pro tier:
 *   Pro Tutor   — $15/month (unlimited tuition posts)
 *   Pro Student — $10/month (priority booking)
 * Returns the hosted checkout URL. When Stripe is not configured, responds
 * 503 with a clear message so the UI can disable the upgrade button.
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

  const role = auth.session.user.role === "tutor" ? "tutor" : "student"
  const priceId = priceIdForRole(role)
  if (!priceId) {
    return jsonError(
      role === "tutor"
        ? "Stripe price id not configured (STRIPE_PRICE_PRO_TUTOR)"
        : "Stripe price id not configured (STRIPE_PRICE_PRO_STUDENT)",
      503
    )
  }

  const planName = role === "tutor" ? "Pro Tutor" : "Pro Student"
  const origin = process.env.BETTER_AUTH_URL ?? new URL(request.url).origin

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: auth.session.user.email,
    client_reference_id: auth.session.user.id,
    metadata: {
      userId: auth.session.user.id,
      plan: "pro",
      planName,
      role,
    },
    success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/payment/cancel`,
  })

  // Record a pending payment row so the webhook can reconcile it.
  const col = await getCollection<Payment>(Collections.payments)
  await col.insertOne({
    userId: auth.session.user.id,
    userEmail: auth.session.user.email,
    userName: auth.session.user.name,
    userRole: role,
    planName,
    stripeSessionId: session.id,
    amount: 0, // filled in by the webhook from the subscription
    currency: "usd",
    paymentStatus: "pending",
    createdAt: new Date(),
  } as Payment)

  return NextResponse.json({ url: session.url, sessionId: session.id })
}
