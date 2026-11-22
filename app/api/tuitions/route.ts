import { NextResponse } from "next/server"
import { z } from "zod"
import {
  getCollection,
  Collections,
  type Tuition,
} from "@/lib/collections"
import { requireApiRole } from "@/lib/authHelper"

/**
 * GET /api/tuitions
 *
 * Public, paginated, searchable list of APPROVED tuitions.
 *
 * Query params:
 *   q        — full-text / substring search over title, subject, description
 *   subject  — exact subject filter
 *   mode     — "online" | "in-person"
 *   level    — exact level filter
 *   minPrice — number
 *   maxPrice — number
 *   sort     — "price_asc" | "price_desc" | "newest" | "oldest"
 *   page     — 1-based (default 1)
 *   limit    — page size (default 12, max 50)
 */

const listQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  subject: z.string().trim().max(80).optional(),
  mode: z.enum(["online", "in-person"]).optional(),
  level: z.string().trim().max(80).optional(),
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

  const { q, subject, mode, level, minPrice, maxPrice, sort, page, limit } =
    parsed.data

  const col = await getCollection<Tuition>(Collections.tuitions)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = { status: "approved" }

  if (subject) filter.subject = subject
  if (mode) filter.mode = mode
  if (level) filter.level = level
  if (typeof minPrice === "number" || typeof maxPrice === "number") {
    filter.price = {}
    if (typeof minPrice === "number") filter.price.$gte = minPrice
    if (typeof maxPrice === "number") filter.price.$lte = maxPrice
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
    price_asc: { price: 1 },
    price_desc: { price: -1 },
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
  level: z.string().trim().min(1).max(80),
  mode: z.enum(["online", "in-person"]),
  location: z.string().trim().max(120).optional(),
  price: z.coerce.number().min(0, "Price must be >= 0").max(100000),
  schedule: z.string().trim().max(160).optional(),
  image: z.string().url().optional().or(z.literal("")),
})

export async function POST(request: Request) {
  const auth = await requireApiRole("tutor")
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

  const { title, description, subject, level, mode, location, price, schedule, image } =
    parsed.data

  if (mode === "in-person" && !location) {
    return NextResponse.json(
      { error: "Location is required for in-person tuitions" },
      { status: 400 }
    )
  }

  const col = await getCollection<Tuition>(Collections.tuitions)
  const now = new Date()

  const tuition: Omit<Tuition, "_id"> = {
    title,
    description,
    subject,
    level,
    mode,
    location,
    price,
    schedule,
    image: image || undefined,
    tutorId: auth.session.user.id,
    tutorName: auth.session.user.name,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  }

  const result = await col.insertOne(tuition as Tuition)

  return NextResponse.json(
    { insertedId: result.insertedId.toString(), tuition: { ...tuition, _id: result.insertedId } },
    { status: 201 }
  )
}

/**
 * GET /api/tuitions/mine
 *
 * List tuitions owned by the signed-in tutor (any status). Tutor-only.
 * Implemented in app/api/tuitions/mine/route.ts.
 */