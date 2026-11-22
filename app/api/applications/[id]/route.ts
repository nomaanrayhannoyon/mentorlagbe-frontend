import { NextResponse } from "next/server"
import { z } from "zod"
import {
  getCollection,
  Collections,
  type Application,
  type Tuition,
} from "@/lib/collections"
import { requireApiRole } from "@/lib/authHelper"
import { toObjectId, jsonError } from "@/lib/api"

type RouteContext = { params: Promise<{ id: string }> }

const patchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("accept") }),
  z.object({ action: z.literal("reject") }),
])

/**
 * PATCH /api/applications/[id]
 *
 * - Tutors can accept / reject applications to their own tuitions.
 * - Admins can accept / reject any application.
 *
 * Students cancel via DELETE (see below) — the spec keeps application
 * statuses to pending / accepted / rejected.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiRole(["tutor", "admin"])
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const { id } = await context.params
  const appId = toObjectId(id)
  if (!appId) return jsonError("Invalid application id", 400)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError("Invalid JSON body")
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError("Validation failed", 422, parsed.error.flatten())
  }
  const { action } = parsed.data

  const col = await getCollection<Application>(Collections.applications)
  const application = await col.findOne({ _id: appId })
  if (!application) return jsonError("Application not found", 404)

  const role = auth.session.user.role
  const userId = auth.session.user.id

  // Authorization
  if (role === "tutor") {
    const tuitionsCol = await getCollection<Tuition>(Collections.tuitions)
    const tuitionObjectId = toObjectId(application.tuitionId)
    if (!tuitionObjectId) return jsonError("Corrupt application", 500)
    const tuition = await tuitionsCol.findOne({ _id: tuitionObjectId })
    if (!tuition || tuition.tutorId !== userId)
      return jsonError("Forbidden", 403)
    if (application.status !== "pending") {
      return jsonError("Application is no longer pending", 400)
    }
  }
  // admin falls through with no extra restriction

  const nextStatus = action === "accept" ? "accepted" : "rejected"

  await col.updateOne(
    { _id: appId },
    { $set: { status: nextStatus, updatedAt: new Date() } }
  )

  const updated = await col.findOne({ _id: appId })
  return NextResponse.json(updated)
}

/**
 * DELETE /api/applications/[id]
 *
 * Students cancel (delete) their own application while it is still
 * 'pending' — the spec's "Cancel/Delete an application while its status
 * is still pending". Admins may delete any application.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiRole(["student", "admin"])
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const { id } = await context.params
  const appId = toObjectId(id)
  if (!appId) return jsonError("Invalid application id", 400)

  const col = await getCollection<Application>(Collections.applications)
  const application = await col.findOne({ _id: appId })
  if (!application) return jsonError("Application not found", 404)

  const role = auth.session.user.role
  const userId = auth.session.user.id

  if (role === "student") {
    if (application.studentId !== userId) return jsonError("Forbidden", 403)
    if (application.status !== "pending") {
      return jsonError("Only pending applications can be cancelled", 400)
    }
  }

  await col.deleteOne({ _id: appId })
  return NextResponse.json({ ok: true })
}
