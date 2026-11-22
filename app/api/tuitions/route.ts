import { NextResponse } from "next/server"
import { z } from "zod"
import { getCollection, Collections, type Tuition } from "@/lib/collections"
import { verifyTutor } from "@/lib/authHelper"
import { canPostTuition, getPlanLimits, planLimitMessage } from "@/lib/plans"

/**
 * GET /api/tuitions
 *
 * Public, paginated, searchable list of APPROVED tuitions
 * (Challenge 1: server-side search & filter).
 *
 * Query params:
 *   q           — substring search over title, subject, description
 *   subject     — exact subject filter
 *   mode        — "Online" | "Offline"
 *   classLevel  — exact class level filter (e.g. "Class 9", "HSC")
 *   minPrice    — minimum monthlyFee
 *   maxPrice    — maximum monthlyFee
 *   sort        — "price_asc" | "price_desc" | "newest" | "oldest"
 *   page        — 1-based (default 1)
 *   limit       — page size (default 12, max 50)
 */

const listQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  subject: z.string().trim().max(80).optional(),
  mode: z.enum(["Online", "Offline"]).optional(),
  classLevel: z.string().trim().max(80).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z
    .enum(["price_asc", "price_desc", "newest", "oldest"])
    .default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries())
  )
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const {
    q,
    subject,
    mode,
    classLevel,
    minPrice,
    maxPrice,
    sort,
    page,
    limit,
  } = parsed.data

  const col = await getCollection<Tuition>(Collections.tuitions)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {
    approvalStatus: "approved",
    isActive: true,
  }

  if (subject) filter.subject = subject
  if (mode) filter.mode = mode
  if (classLevel) filter.classLevel = classLevel
  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    filter.monthlyFee = {}
    if (typeof minPrice === "number") filter.monthlyFee.$gte = minPrice
    if (typeof maxPrice === "number") filter.monthlyFee.$lte = maxPrice
  }
  if (q) {
    // Use a regex for substring matching (the text index is used by $text,
    // but a regex is more predictable for short queries).
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    filter.$or = [
      { title: { $regex: safe, $options: "i" } },
      { subject: { $regex: safe, $options: "i" } },
      { description: { $regex: safe, $options: "i" } },
    ]
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price_asc: { monthlyFee: 1 },
    price_desc: { monthlyFee: -1 },
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
  }

  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    col
      .find(filter)
      .project({ tutorId: 0 })
      .sort(sortMap[sort])
      .skip(skip)
      .limit(limit)
      .toArray(),
    col.countDocuments(filter),
  ])

  return NextResponse.json({
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
}

/**
 * POST /api/tuitions
 *
 * Create a tuition (tutor role only). New tuitions start as `pending` and
 * only become visible after an admin approves them.
 */
const createSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(120),
  description: z.string().trim().min(20, "Description is too short").max(2000),
  subject: z.string().trim().min(2).max(80),
  classLevel: z.string().trim().min(1).max(80),
  mode: z.enum(["Online", "Offline"]),
  location: z.string().trim().max(120).optional(),
  monthlyFee: z.coerce.number().min(0, "Monthly fee must be >= 0").max(100000),
  daysPerWeek: z.coerce.number().int().min(1).max(7).optional(),
  bannerImage: z.string().url().optional().or(z.literal("")),
})

export async function POST(request: Request) {
  const auth = await verifyTutor()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const {
    title,
    description,
    subject,
    classLevel,
    mode,
    location,
    monthlyFee,
    daysPerWeek,
    bannerImage,
  } = parsed.data

  if (mode === "Offline" && !location) {
    return NextResponse.json(
      { error: "Location is required for offline tuitions" },
      { status: 400 }
    )
  }

  const col = await getCollection<Tuition>(Collections.tuitions)

  // Enforce the free-plan tuition post limit on the server. The plan comes
  // from the user document (set only by the Stripe webhook), never the client.
  const plan = auth.session.user.plan ?? "free"
  if (
    !canPostTuition(
      plan,
      await col.countDocuments({ tutorId: auth.session.user.id })
    )
  ) {
    return NextResponse.json(
      {
        error: planLimitMessage("posts", plan),
        code: "PLAN_LIMIT_REACHED",
        limit: getPlanLimits(plan).maxTuitionPosts,
      },
      { status: 403 }
    )
  }

  const now = new Date()

  const tuition: Omit<Tuition, "_id"> = {
    title,
    description,
    subject,
    classLevel,
    mode,
    location: mode === "Offline" ? location : undefined,
    monthlyFee,
    daysPerWeek,
    bannerImage: bannerImage || undefined,
    tutorId: auth.session.user.id,
    tutorName: auth.session.user.name,
    tutorEmail: auth.session.user.email,
    approvalStatus: "pending",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  }

  const result = await col.insertOne(tuition as Tuition)

  return NextResponse.json(
    {
      insertedId: result.insertedId.toString(),
      tuition: { ...tuition, _id: result.insertedId },
    },
    { status: 201 }
  )
}

/**
 * GET /api/tuitions/mine
 *
 * List tuitions owned by the signed-in tutor (any status). Tutor-only.
 * Implemented in app/api/tuitions/mine/route.ts.
 */
