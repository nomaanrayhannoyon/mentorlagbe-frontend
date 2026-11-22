"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2, CreditCard, TrendingUp } from "lucide-react"
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

type AdminPaymentsResponse = {
  items: Payment[]
  stats: {
    totalPayments: number
    paidCount: number
    pendingCount: number
    failedCount: number
    totalRevenue: number
    revenueByPlan: Record<string, number>
  }
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-5">
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  )
}

export function AdminPaymentsList() {
  const [data, setData] = useState<AdminPaymentsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiFetch<AdminPaymentsResponse>("/api/admin/payments")
      setData(res)
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

  if (!data || data.items.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-12 text-center">
        <CreditCard className="size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No payments yet</h3>
        <p className="text-sm text-muted-foreground">
          Payment records will appear here as they come in.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Total revenue"
          value={`$${data.stats.totalRevenue.toFixed(2)}`}
        />
        <StatTile label="Paid" value={data.stats.paidCount} />
        <StatTile label="Pending" value={data.stats.pendingCount} />
        <StatTile label="Failed" value={data.stats.failedCount} />
      </div>

      <div className="grid gap-4">
        {data.items.map((p) => (
          <Card key={p._id} className="flex items-center justify-between p-5">
            <div>
              <p className="font-semibold">
                {p.planName ?? "Payment"}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  user: {p.userId.slice(0, 8)}…
                </span>
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
              <Badge variant={statusVariant[p.paymentStatus]} className="mt-1">
                {p.paymentStatus}
              </Badge>
            </div>
          </Card>
        ))}
      </div>

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingUp className="size-4" />
        Revenue is the sum of all payments marked as paid.
      </p>
    </div>
  )
}
