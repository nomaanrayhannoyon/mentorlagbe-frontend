import { NextResponse } from "next/server"
import type { Filter } from "mongodb"
import { getCollection, Collections, type Tuition } from "@/lib/collections"
import { verifyAdmin } from "@/lib/authHelper"
import { jsonError } from "@/lib/api"

/**
 * GET /api/admin/tuitions
 * List ALL tuitions (any approvalStatus) for the moderation queue.
 * Optional ?approvalStatus=pending|approved|rejected filter.
 *
 * Note: the moderation POST handler lives at
 * /api/admin/tuitions/[id]/review (see that folder). This file only
 * provides the list endpoint so both verbs are reachable.
 */
export async function GET(request: Request) {
  const auth = await verifyAdmin()
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const { searchParams } = new URL(request.url)
  const approvalStatus =
    searchParams.get("approvalStatus") ?? searchParams.get("status")

  const col = await getCollection<Tuition>(Collections.tuitions)
  const filter: Filter<Tuition> =
    approvalStatus === "pending" ||
    approvalStatus === "approved" ||
    approvalStatus === "rejected"
      ? { approvalStatus }
      : {}
  const items = await col.find(filter).sort({ createdAt: -1 }).toArray()
  return NextResponse.json({ items })
}
