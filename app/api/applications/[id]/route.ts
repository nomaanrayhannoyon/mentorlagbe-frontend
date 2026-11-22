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
  z.object({ action: z.literal("withdraw") }),
])

/**
 * PATCH /api/applications/[id]
 *
 * - Tutors can accept / reject applications to their own tuitions.
 * - Students can withdraw their own applications.
 * - Admins can accept / reject any.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiRole(["student", "tutor", "admin"])
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
  if (role === "student") {
    if (application.studentId !== userId) return jsonError("Forbidden", 403)
    if (action !== "withdraw") {
      return jsonError("Students can only withdraw their own applications", 403)
    }
    if (application.status !== "pending") {
      return jsonError("Only pending applications can be withdrawn", 400)
    }
  } else if (role === "tutor") {
    if (action === "withdraw") return jsonError("Forbidden", 403)
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

  const nextStatus =
    action === "accept"
      ? "accepted"
      : action === "reject"
        ? "rejected"
        : "withdrawn"

  await col.updateOne(
    { _id: appId },
    { $set: { status: nextStatus, updatedAt: new Date() } }
  )

  const updated = await col.findOne({ _id: appId })
  return NextResponse.json(updated)
}
