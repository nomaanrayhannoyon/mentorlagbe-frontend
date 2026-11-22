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
 *
 * Applications denormalise the tuition summary (tuitionTitle, subject,
 * monthlyFee,  tutorEmail) at write time per the assignment's
 * data design, so no join is needed here.
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

  const items = await col.find(filter).sort({ appliedAt: -1 }).toArray()

  return NextResponse.json({ items })
}

const createSchema = z.object({
  tuitionId: z.string().min(1, "tuitionId is required"),
  studentPhone: z.string().trim().min(7, "A phone number is required").max(30),
  preferredSchedule: z
    .string()
    .trim()
    .min(3, "Tell the tutor when you are available")
    .max(160),
  studentNote: z.string().trim().max(2000).optional().default(""),
})

/**
 * POST /api/applications
 * Student applies to a tuition (status: 'pending'). Duplicate applications
 * from the same student for the same tuition are blocked by the unique
 * index plus an explicit check.
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

  const { tuitionId, studentPhone, preferredSchedule, studentNote } =
    parsed.data
  const tuitionObjectId = toObjectId(tuitionId)
  if (!tuitionObjectId) return jsonError("Invalid tuitionId", 400)

  const tuitionsCol = await getCollection<Tuition>(Collections.tuitions)
  const tuition = await tuitionsCol.findOne({ _id: tuitionObjectId })
  if (!tuition || tuition.approvalStatus !== "approved") {
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
    tuitionTitle: tuition.title,
    subject: tuition.subject,
    monthlyFee: tuition.monthlyFee,
    tutorEmail: tuition.tutorEmail ?? "",
    studentId: auth.session.user.id,
    studentName: auth.session.user.name,
    studentEmail: auth.session.user.email,
    studentPhone,
    preferredSchedule,
    studentNote,
    status: "pending",
    appliedAt: now,
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
