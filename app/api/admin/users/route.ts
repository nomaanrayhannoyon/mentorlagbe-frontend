import { NextResponse } from "next/server"
import { z } from "zod"
import { getCollection, Collections, type Role } from "@/lib/collections"
import { requireApiRole } from "@/lib/authHelper"
import { jsonError, toObjectId } from "@/lib/api"

/**
 * GET /api/admin/users
 * Admin-only: list all users (profile fields only, never passwordHash).
 */
export async function GET() {
  const auth = await requireApiRole("admin")
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const col = await getCollection<Record<string, unknown>>(Collections.users)
  const users = await col
    .find(
      {},
      {
        projection: {
          // better-auth hashes live under `password` on the account record,
          // but we defensively strip any password-like field from `user`.
          password: 0,
          passwordHash: 0,
        },
      }
    )
    .sort({ createdAt: -1 })
    .toArray()

  const safe = users.map((u) => ({
    _id: String(u._id),
    name: u.name,
    email: u.email,
    emailVerified: u.emailVerified,
    role: u.role,
    phone: u.phone,
    bio: u.bio,
    image: u.image,
    createdAt: u.createdAt,
  }))

  return NextResponse.json({ users: safe })
}

const patchSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["student", "tutor", "admin"]),
})

/**
 * PATCH /api/admin/users
 * Admin-only: change a user's role. Cannot demote the last admin (self).
 */
export async function PATCH(request: Request) {
  const auth = await requireApiRole("admin")
  if (!auth.ok) return jsonError(auth.error, auth.status)

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
  const { userId, role } = parsed.data as { userId: string; role: Role }

  const userObjectId = toObjectId(userId)
  if (!userObjectId) return jsonError("Invalid userId", 400)

  if (userId === auth.session.user.id && role !== "admin") {
    return jsonError("You cannot remove your own admin role", 400)
  }

  const col = await getCollection<Record<string, unknown>>(Collections.users)
  const result = await col.updateOne(
    { _id: userObjectId },
    { $set: { role, updatedAt: new Date() } }
  )

  if (result.matchedCount === 0) return jsonError("User not found", 404)
  return NextResponse.json({ ok: true, role })
}
