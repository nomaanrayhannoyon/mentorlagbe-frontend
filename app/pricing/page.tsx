import { PricingContent } from "@/components/pricing/pricing-content"
import { verifyToken } from "@/lib/authHelper"

export const metadata = {
  title: "Pricing",
}

/**
 * The role shown on the pricing page comes from the server-verified Better
 * Auth session — never from the URL or client-side state. Guests (no session)
 * see both Student and Tutor plans.
 */
export default async function PricingPage() {
  const session = await verifyToken()

  return (
    <PricingContent
      role={session?.user.role ?? null}
      plan={session?.user.plan ?? "free"}
    />
  )
}
