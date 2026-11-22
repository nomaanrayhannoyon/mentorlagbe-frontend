import { NextResponse } from "next/server"
import { getCollection, Collections, type Payment } from "@/lib/collections"
import { getApiSession } from "@/lib/authHelper"
import { jsonError } from "@/lib/api"

/**
 * GET /api/payments
 * List the signed-in user's own payment records.
 */
export async function GET() {
  const auth = await getApiSession()
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const col = await getCollection<Payment>(Collections.payments)
  const items = await col
    .find({ userId: auth.session.user.id })
    .sort({ createdAt: -1 })
    .toArray()

  return NextResponse.json({ items })
}
