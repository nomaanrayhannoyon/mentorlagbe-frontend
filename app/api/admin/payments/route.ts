import { NextResponse } from "next/server"
import { getCollection, Collections, type Payment } from "@/lib/collections"
import { verifyAdmin } from "@/lib/authHelper"
import { jsonError } from "@/lib/api"

/**
 * GET /api/admin/payments
 * Admin-only. Returns every payment record plus aggregate revenue stats:
 * total collected, count of paid vs pending, and revenue grouped by plan.
 */
export async function GET() {
  const auth = await verifyAdmin()
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const col = await getCollection<Payment>(Collections.payments)
  const items = await col.find({}).sort({ createdAt: -1 }).toArray()

  const paid = items.filter((p) => p.paymentStatus === "paid")
  const totalRevenue = paid.reduce((sum, p) => sum + (p.amount ?? 0), 0)
  const pendingCount = items.filter((p) => p.paymentStatus === "pending").length
  const failedCount = items.filter((p) => p.paymentStatus === "failed").length

  // Revenue split by plan (Pro Tutor vs Pro Student).
  const revenueByPlan: Record<string, number> = {}
  for (const p of paid) {
    const plan = p.planName ?? "Pro"
    revenueByPlan[plan] = (revenueByPlan[plan] ?? 0) + (p.amount ?? 0)
  }

  return NextResponse.json({
    items,
    stats: {
      totalPayments: items.length,
      paidCount: paid.length,
      pendingCount,
      failedCount,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      revenueByPlan,
    },
  })
}
