import { NextResponse } from "next/server"
import { z } from "zod"
import {
  getCollection,
  Collections,
  type Tuition,
} from "@/lib/collections"
import { requireApiRole } from "@/lib/authHelper"
import { toObjectId, jsonError } from "@/lib/api"

/**
 * POST /api/admin/tuitions/[id]/review
 * Admin-only: approve or reject a tuition.
 * Body: { status: "approved" | "rejected", moderationNote?: string }
 *
 * (The moderation queue listing lives at GET /api/admin/tuitions.)
 */

type ReviewContext = { params: Promise<{ id: string }> }

const reviewSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  moderationNote: z.string().trim().max(500).optional(),
})

export async function POST(request: Request, context: ReviewContext) {
  const auth = await requireApiRole("admin")
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const { id } = await context.params
  const tuitionId = toObjectId(id)
  if (!tuitionId) return jsonError("Invalid tuition id", 400)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError("Invalid JSON body")
  }

  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError("Validation failed", 422, parsed.error.flatten())
  }
  const { status, moderationNote } = parsed.data

  const col = await getCollection<Tuition>(Collections.tuitions)
  const updated = await col.findOneAndUpdate(
    { _id: tuitionId },
    {
      $set: {
        status,
        moderationNote,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" }
  )

  if (!updated) return jsonError("Tuition not found", 404)
  return NextResponse.json(updated)
}