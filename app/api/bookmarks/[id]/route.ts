import { NextResponse } from "next/server"
import {
  getCollection,
  Collections,
  type Bookmark,
} from "@/lib/collections"
import { getApiSession } from "@/lib/authHelper"
import { jsonError, toObjectId } from "@/lib/api"

type RouteContext = { params: Promise<{ id: string }> }

/**
 * DELETE /api/bookmarks/[id]
 * Unsave a tuition. `id` is the tuitionId.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await getApiSession()
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const { id } = await context.params
  if (!toObjectId(id)) return jsonError("Invalid tuitionId", 400)

  const col = await getCollection<Bookmark>(Collections.bookmarks)
  const result = await col.deleteOne({
    userId: auth.session.user.id,
    tuitionId: id,
  })

  if (result.deletedCount === 0) {
    return jsonError("Bookmark not found", 404)
  }
  return NextResponse.json({ ok: true })
}