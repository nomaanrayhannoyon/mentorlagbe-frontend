import { NextResponse } from "next/server"
import { z } from "zod"
import {
  getCollection,
  Collections,
  type Application,
  type Tuition,
} from "@/lib/collections"
import { requireApiRole, getApiSession } from "@/lib/authHelper"
import { toObjectId, jsonError } from "@/lib/api"

/**
 * GET /api/applications
 *
 * - Students see their own applications.
 * - Tutors see applications to their tuitions.
 * - Admins see everything.
 */
export async function GET() {
  const auth = await getApiSession()
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const col = await getCollection<Application>(Collections.applications)
  const role = auth.session.user.role
  const userId = auth.session.user.id

  let filter: Record<string, unknown> = {}

  if (role === "admin") {
    // all
  } else if (role === "tutor") {
    const tuitionsCol = await getCollection<Tuition>(Collections.tuitions)
    const tuitions = await tuitionsCol
      .find({ tutorId: userId })
      .project({ _id: 1 })
      .toArray()
    const tuitionIds = tuitions.map((t) => t._id.toString())
    filter = { tuitionId: { $in: tuitionIds } }
  } else {
    filter = { studentId: userId }
  }

  const items = await col.find(filter).sort({ createdAt: -1 }).toArray()

  // Join the referenced tuition (title/subject/level/mode/price) so every
  // role can render meaningful cards without a second round-trip. For admins
  // this includes pending/rejected tuitions; for tutors it is limited to their
  // own tuitions by the filter above.
  const tuitionIds = [
    ...new Set(items.map((i) => i.tuitionId).filter((id) => toObjectId(id))),
  ]
  const tuitionsCol = await getCollection<Tuition>(Collections.tuitions)
  const tuitions = await tuitionsCol
    .find({
      _id: { $in: tuitionIds.map((id) => toObjectId(id)!) },
    })
    .project({ title: 1, subject: 1, level: 1, mode: 1, price: 1 })
    .toArray()
  const tuitionMap = new Map(tuitions.map((t) => [t._id.toString(), t]))

  const enriched = items.map((item) => {
    const t = tuitionMap.get(item.tuitionId)
    return {
      ...item,
      tuition: t
        ? {
            title: t.title,
            subject: t.subject,
            level: t.level,
            mode: t.mode,
            price: t.price,
          }
        : undefined,
    }
  })

  return NextResponse.json({ items: enriched })
}

const createSchema = z.object({
  tuitionId: z.string().min(1, "tuitionId is required"),
  message: z.string().trim().max(2000).optional().default(""),
})

/**
 * POST /api/applications
 * Student applies to a tuition.
 */
export async function POST(request: Request) {
  const auth = await requireApiRole("student")
  if (!auth.ok) return jsonError(auth.error, auth.status)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError("Invalid JSON body")
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success)
    return jsonError("Validation failed", 422, parsed.error.flatten())

  const { tuitionId, message } = parsed.data
  const tuitionObjectId = toObjectId(tuitionId)
  if (!tuitionObjectId) return jsonError("Invalid tuitionId", 400)

  const tuitionsCol = await getCollection<Tuition>(Collections.tuitions)
  const tuition = await tuitionsCol.findOne({ _id: tuitionObjectId })
  if (!tuition || tuition.status !== "approved") {
    return jsonError("Tuition not found or not available", 404)
  }
  if (tuition.tutorId === auth.session.user.id) {
    return jsonError("You cannot apply to your own tuition", 400)
  }

  const col = await getCollection<Application>(Collections.applications)
  const existing = await col.findOne({
    tuitionId,
    studentId: auth.session.user.id,
  })
  if (existing) {
    return jsonError("You have already applied to this tuition", 409)
  }

  const now = new Date()
  const doc: Omit<Application, "_id"> = {
    tuitionId,
    studentId: auth.session.user.id,
    studentName: auth.session.user.name,
    message,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  }

  const result = await col.insertOne(doc as Application)
  return NextResponse.json(
    {
      insertedId: result.insertedId.toString(),
      application: { ...doc, _id: result.insertedId },
    },
    { status: 201 }
  )
}
