import { NextResponse } from "next/server"
import { getCollection, Collections, type Tuition } from "@/lib/collections"
import { requireApiRole } from "@/lib/authHelper"

/**
 * GET /api/tuitions/mine
 * Tutor-only: list the signed-in tutor's tuitions (any status).
 */
export async function GET() {
  const auth = await requireApiRole("tutor")
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const col = await getCollection<Tuition>(Collections.tuitions)
  const items = await col
    .find({ tutorId: auth.session.user.id })
    .sort({ createdAt: -1 })
    .toArray()

  return NextResponse.json({ items })
}
