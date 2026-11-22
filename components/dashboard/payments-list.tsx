"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, CreditCard } from "lucide-react"
import { toast } from "sonner"

import { apiFetch, ApiError } from "@/lib/api-client"
import type { Payment, PaymentStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

const statusVariant: Record<
  PaymentStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  paid: "default",
  failed: "destructive",
  refunded: "outline",
}

export function PaymentsList() {
  const [items, setItems] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ items: Payment[] }>("/api/payments")
      setItems(data.items)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not load payments."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Loading payments…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-12 text-center">
        <CreditCard className="size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No payments yet</h3>
        <p className="text-sm text-muted-foreground">
          Your payment history will appear here.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {items.map((p) => (
        <Card key={p._id} className="flex items-center justify-between p-5">
          <div>
            <p className="font-semibold">
              {p.plan === "pro" ? "Pro Membership" : "Payment"}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(p.createdAt).toLocaleDateString()} ·{" "}
              {p.currency.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold">
              {p.amount > 0 ? `$${p.amount.toFixed(2)}` : "—"}
            </p>
            <Badge variant={statusVariant[p.status]} className="mt-1">
              {p.status}
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  )
}
