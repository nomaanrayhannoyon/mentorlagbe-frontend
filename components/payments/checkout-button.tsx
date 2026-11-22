"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Crown } from "lucide-react"
import { toast } from "sonner"

import { apiFetch, ApiError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"

/**
 * Stripe Checkout button. When the user is signed in and Stripe is
 * configured, this creates a Checkout Session and redirects to Stripe.
 * Otherwise it routes to sign-up / shows a clear "not configured" message.
 */
export function CheckoutButton({
  plan = "pro",
  label = "Upgrade to Pro",
}: {
  plan?: "pro"
  label?: string
}) {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!session) {
      router.push(`/sign-up?plan=${plan}`)
      return
    }

    setLoading(true)
    try {
      const res = await apiFetch<{ url: string }>("/api/payments/checkout", {
        method: "POST",
        body: { plan },
      })
      if (res.url) {
        window.location.href = res.url
      } else {
        toast.error("Could not start checkout.")
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not start checkout."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleClick} disabled={loading} className="w-full">
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Crown className="size-4" />
      )}
      {label}
    </Button>
  )
}
