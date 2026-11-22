import { NextResponse } from "next/server"
import { z } from "zod"
import { getCollection, Collections, type Tuition } from "@/lib/collections"
import { verifyTutor, requireApiRole } from "@/lib/authHelper"
import { toObjectId, jsonError } from "@/lib/api"

type RouteContext = { params: Promise<{ id: string }> }

/**
 * GET /api/tuitions/[id]
 * Public: returns a single approved tuition, or any status if the requester
 * owns it or is an admin.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  const objectId = toObjectId(id)
  if (!objectId) return jsonError("Invalid tuition id", 400)

  const col = await getCollection<Tuition>(Collections.tuitions)
  const tuition = await col.findOne({ _id: objectId })
  if (!tuition) return jsonError("Tuition not found", 404)

  // Only approved tuitions are public.
  if (tuition.approvalStatus !== "approved") {
    const auth = await requireApiRole(["tutor", "admin"])
    if (!auth.ok) return jsonError("Tuition not found", 404)
    const isOwner = tuition.tutorId === auth.session.user.id
    const isAdmin = auth.session.user.role === "admin"
    if (!isOwner && !isAdmin) return jsonError("Tuition not found", 404)
  }

  return NextResponse.json(tuition)
}

const updateSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().min(20).max(2000).optional(),
  subject: z.string().trim().min(2).max(80).optional(),
  classLevel: z.string().trim().min(1).max(80).optional(),
  mode: z.enum(["Online", "Offline"]).optional(),
  location: z.string().trim().max(120).optional(),
  monthlyFee: z.coerce.number().min(0).max(100000).optional(),
  daysPerWeek: z.coerce.number().int().min(1).max(7).optional(),
  bannerImage: z.string().url().optional().or(z.literal("")),
  /** Tutors can open/close their tuition for new applications. */
  isActive: z.boolean().optional(),
})

/**
 * PATCH /api/tuitions/[id]
 * Tutor-only: update own tuition.
 *
 * Editing content sends the tuition back to `pending` for re-approval.
 * Toggling only `isActive` (open/close) does NOT trigger re-moderation.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await verifyTutor()
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const { id } = await context.params
  const objectId = toObjectId(id)
  if (!objectId) return jsonError("Invalid tuition id", 400)

  const col = await getCollection<Tuition>(Collections.tuitions)
  const existing = await col.findOne({ _id: objectId })
  if (!existing) return jsonError("Tuition not found", 404)
  if (existing.tutorId !== auth.session.user.id) {
    return jsonError("Forbidden", 403)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError("Invalid JSON body")
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success)
    return jsonError("Validation failed", 422, parsed.error.flatten())

  const { bannerImage, isActive, ...rest } = parsed.data

  const update: Partial<Tuition> & { updatedAt: Date } = {
    ...(bannerImage !== undefined
      ? { bannerImage: bannerImage || undefined }
      : {}),
    ...(isActive !== undefined ? { isActive } : {}),
    updatedAt: new Date(),
  }

  // Content edits require re-moderation; a bare open/close toggle does not.
  const hasContentEdits =
    Object.keys(rest).length > 0 || bannerImage !== undefined
  if (hasContentEdits) {
    Object.assign(update, rest)
    update.approvalStatus = "pending"
    update.moderationNote = undefined
  }

  await col.updateOne({ _id: objectId }, { $set: update })
  const updated = await col.findOne({ _id: objectId })
  return NextResponse.json(updated)
}

/**
 * DELETE /api/tuitions/[id]
 * Tutor-only: delete own tuition (or admin can delete any).
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiRole(["tutor", "admin"])
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const { id } = await context.params
  const objectId = toObjectId(id)
  if (!objectId) return jsonError("Invalid tuition id", 400)

  const col = await getCollection<Tuition>(Collections.tuitions)
  const existing = await col.findOne({ _id: objectId })
  if (!existing) return jsonError("Tuition not found", 404)

  const isAdmin = auth.session.user.role === "admin"
  if (!isAdmin && existing.tutorId !== auth.session.user.id) {
    return jsonError("Forbidden", 403)
  }

  await col.deleteOne({ _id: objectId })
  return NextResponse.json({ ok: true })
}
