import { NextResponse } from "next/server"
import { z } from "zod"
import {
  getCollection,
  Collections,
  type Bookmark,
} from "@/lib/collections"
import { getApiSession } from "@/lib/authHelper"
import { jsonError, toObjectId } from "@/lib/api"

/**
 * Bookmarks API.
 *
 * GET  /api/bookmarks        — list the signed-in user's saved tuition ids.
 * POST /api/bookmarks        — save a tuition. Body: { tuitionId }
 * DELETE /api/bookmarks/[id] — unsave a tuition (id = tuitionId).
 */

export async function GET() {
  const auth = await getApiSession()
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const col = await getCollection<Bookmark>(Collections.bookmarks)
  const items = await col
    .find({ userId: auth.session.user.id })
    .sort({ createdAt: -1 })
    .toArray()

  return NextResponse.json({
    items,
    tuitionIds: items.map((b) => b.tuitionId),
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

  const col = await getCollection<Bookmark>(Collections.bookmarks)
  const existing = await col.findOne({
    userId: auth.session.user.id,
    tuitionId,
  })
  if (existing) {
    return NextResponse.json({ ok: true, alreadySaved: true })
  }

  await col.insertOne({
    userId: auth.session.user.id,
    tuitionId,
    createdAt: new Date(),
  } as Bookmark)

  return NextResponse.json({ ok: true, saved: true }, { status: 201 })
}