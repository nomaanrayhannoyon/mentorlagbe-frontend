import { NextResponse } from "next/server"
import {
  getCollection,
  Collections,
  type UserDocument,
} from "@/lib/collections"
import { getApiSession } from "@/lib/authHelper"
import { jsonError, toObjectId } from "@/lib/api"

type RouteContext = { params: Promise<{ id: string }> }

/**
 * DELETE /api/bookmarks/[id]
 * Unsave a tuition. `id` is the tuitionId.
 *
 * Bookmarks live on the user document (`savedTuitions: string[]`), so this
 * pulls the id from the array rather than touching a separate collection.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await getApiSession()
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const { id } = await context.params
  if (!toObjectId(id)) return jsonError("Invalid tuitionId", 400)

  const userObjectId = toObjectId(auth.session.user.id)
  if (!userObjectId) return jsonError("Invalid user", 400)

  const col = await getCollection<UserDocument>(Collections.users)
  const result = await col.updateOne(
    { _id: userObjectId },
    { $pull: { savedTuitions: id } }
  )

  if (result.modifiedCount === 0) {
    return jsonError("Bookmark not found", 404)
  }
  return NextResponse.json({ ok: true })
}
