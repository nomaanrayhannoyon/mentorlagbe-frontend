import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import type { Role } from "@/lib/collections"

export type SessionUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: Role
  phone?: string
  bio?: string
  image?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export type Session = {
  session: {
    id: string
    userId: string
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
    ipAddress?: string
    userAgent?: string
  }
  user: SessionUser
}

/**
 * Verify the current session server-side by reading the better-auth cookie
 * from the incoming request headers and asking better-auth to validate it.
 * This is the authoritative "JWT/session verification" path: the cookie
 * contains a signed session token, and better-auth validates the signature
 * and the backing session record.
 */
export async function getSession(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return null
  return session as unknown as Session
}

/** Like getSession but throws a redirect to /sign-in if unauthenticated. */
export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    redirect("/sign-in")
  }
  return session
}

/** Require one of the given roles, redirecting unauthorized users to /dashboard. */
export async function requireRole(allowed: Role | Role[]): Promise<Session> {
  const session = await requireSession()
  const roles = Array.isArray(allowed) ? allowed : [allowed]
  if (!roles.includes(session.user.role)) {
    redirect("/dashboard")
  }
  return session
}

export function hasRole(session: Session, allowed: Role | Role[]): boolean {
  const roles = Array.isArray(allowed) ? allowed : [allowed]
  return roles.includes(session.user.role)
}

/**
 * Convenience wrapper for API routes that returns a discriminated result
 * instead of throwing/redirecting, so route handlers can respond with the
 * correct HTTP status.
 */
export async function getApiSession(): Promise<
  { ok: true; session: Session } | { ok: false; status: number; error: string }
> {
  const session = await getSession()
  if (!session) {
    return { ok: false, status: 401, error: "Unauthenticated" }
  }
  return { ok: true, session }
}

export async function requireApiRole(
  allowed: Role | Role[]
): Promise<
  { ok: true; session: Session } | { ok: false; status: number; error: string }
> {
  const result = await getApiSession()
  if (!result.ok) return result
  const roles = Array.isArray(allowed) ? allowed : [allowed]
  if (!roles.includes(result.session.user.role)) {
    return {
      ok: false,
      status: 403,
      error: `Forbidden: requires one of [${roles.join(", ")}]`,
    }
  }
  return result
}
