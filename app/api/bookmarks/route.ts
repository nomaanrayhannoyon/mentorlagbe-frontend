import { NextResponse } from "next/server"
import { z } from "zod"
import {
  getCollection,
  Collections,
  type UserDocument,
} from "@/lib/collections"
import { getApiSession } from "@/lib/authHelper"
import { toObjectId, jsonError } from "@/lib/api"
import { canBookmark, getPlanLimits, planLimitMessage } from "@/lib/plans"

/**
 * Bookmarks API.
 *
 * Bookmarks are stored on the user document as `savedTuitions: string[]` so
 * the database keeps exactly four domain collections.
 *
 *   GET    /api/bookmarks        — list saved tuition ids + user's plan limits
 *   POST   /api/bookmarks        — save a tuition   { tuitionId }
 *   DELETE /api/bookmarks/[id]   — unsave a tuition (id = tuitionId)
 */

const usersCol = () => getCollection<UserDocument>(Collections.users)

export async function GET() {
  const auth = await getApiSession()
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const plan = auth.session.user.plan ?? "free"
  const limits = getPlanLimits(plan)

  const user = await (
    await usersCol()
  ).findOne(
    { _id: toObjectId(auth.session.user.id)! },
    { projection: { savedTuitions: 1 } }
  )

  const tuitionIds = user?.savedTuitions ?? []

  return NextResponse.json({
    items: tuitionIds.map((tuitionId) => ({ tuitionId })),
    tuitionIds,
    plan,
    limit: limits.maxBookmarks,
  })
}

const postSchema = z.object({ tuitionId: z.string().min(1) })

export async function POST(request: Request) {
  const auth = await getApiSession()
  if (!auth.ok) return jsonError(auth.error, auth.status)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError("Invalid JSON body")
  }
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError("Validation failed", 422, parsed.error.flatten())
  }

  const { tuitionId } = parsed.data
  if (!toObjectId(tuitionId)) return jsonError("Invalid tuitionId", 400)

  const userId = auth.session.user.id
  const userObjectId = toObjectId(userId)
  if (!userObjectId) return jsonError("Invalid user", 400)

  const col = await usersCol()
  const user = await col.findOne({ _id: userObjectId })
  const saved: string[] = user?.savedTuitions ?? []

  if (saved.includes(tuitionId)) {
    return NextResponse.json({ ok: true, alreadySaved: true })
  }

  // Enforce the free-plan bookmark limit server-side.
  const plan = auth.session.user.plan ?? "free"
  if (!canBookmark(plan, saved.length)) {
    return NextResponse.json(
      {
        error: planLimitMessage("bookmarks", plan),
        code: "PLAN_LIMIT_REACHED",
        limit: getPlanLimits(plan).maxBookmarks,
      },
      { status: 403 }
    )
  }

  await col.updateOne(
    { _id: userObjectId },
    { $push: { savedTuitions: tuitionId } }
  )

  return NextResponse.json(
    { ok: true, saved: true, count: saved.length + 1 },
    { status: 201 }
  )
}
