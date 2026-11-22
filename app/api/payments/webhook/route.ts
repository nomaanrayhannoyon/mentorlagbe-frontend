import { NextResponse } from "next/server"
import type Stripe from "stripe"
import { getStripe } from "@/lib/stripe"
import { getCollection, Collections, type Payment } from "@/lib/collections"

/**
 * POST /api/payments/webhook
 *
 * Stripe webhook endpoint. Verifies the signature with STRIPE_WEBHOOK_SECRET
 * and reconciles payment state. Configure this URL in the Stripe dashboard:
 *   https://<your-domain>/api/payments/webhook
 *
 * Events handled:
 *   checkout.session.completed
 *   checkout.session.async_payment_succeeded
 *   checkout.session.async_payment_failed
 *   customer.subscription.deleted
 */
export async function POST(request: Request) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    )
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  // Read the raw body for signature verification.
  const body = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const payCol = await getCollection<Payment>(Collections.payments)

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const amountTotal = session.amount_total ?? 0
        if (session.id) {
          await payCol.updateOne(
            { stripeSessionId: session.id },
            {
              $set: {
                status: "paid",
                amount: amountTotal / 100,
                currency: session.currency ?? "usd",
                plan: (session.metadata?.plan as "pro") ?? "pro",
              },
            },
            { upsert: true }
          )
        }
        void userId
        break
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.id) {
          await payCol.updateOne(
            { stripeSessionId: session.id },
            { $set: { status: "failed" } },
            { upsert: true }
          )
        }
        break
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription
        // Mark the latest paid payment for this customer as refunded.
        await payCol.updateOne(
          { stripeSessionId: sub.id },
          { $set: { status: "refunded" } }
        )
        break
      }
      default:
        // Unhandled event type — acknowledge to avoid Stripe retries.
        break
    }
  } catch (err) {
    // Return 500 so Stripe retries.
    console.error("Webhook handler error", err)
    return NextResponse.json({ error: "Handler error" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
