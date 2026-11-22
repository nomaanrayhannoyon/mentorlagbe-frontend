import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import type { Plan, Role } from "@/lib/collections"

/**
 * Server-side session + role verification.
 *
 * `verifyToken` is the single authoritative check used everywhere: it reads
 * the signed better-auth session cookie (a JWT) from the incoming headers and
 * asks better-auth to validate both the signature and the backing session
 * record. Never trust a role or identity sent by the client.
 */

export type SessionUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: Role
  plan: Plan
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

export type VerifyResult =
  { ok: true; session: Session } | { ok: false; status: number; error: string }

/**
 * Verify the caller's session token.
 *
 * This is the JWT verification step: the `better-auth.session_token` cookie
 * holds a signed token; better-auth checks its signature and confirms the
 * session still exists and has not expired.
 */
export async function verifyToken(): Promise<Session | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) return null

  const user = session.user as unknown as SessionUser
  return {
    session: session.session as unknown as Session["session"],
    // Default plan/role defensively so older documents without the fields
    // still work instead of falling through authorization checks.
    user: {
      ...user,
      role: (user.role ?? "student") as Role,
      plan: (user.plan ?? "free") as Plan,
    },
  }
}

/** Like verifyToken but redirects to /sign-in when unauthenticated. */
export async function requireSession(): Promise<Session> {
  const session = await verifyToken()
  if (!session) redirect("/sign-in")
  return session
}

/**
 * Verify the token AND that the user holds one of the allowed roles.
 * Redirects unauthorized users to their dashboard.
 */
export async function requireRole(allowed: Role | Role[]): Promise<Session> {
  const session = await requireSession()
  if (!hasRole(session, allowed)) redirect("/dashboard")
  return session
}

export function hasRole(session: Session, allowed: Role | Role[]): boolean {
  const roles = Array.isArray(allowed) ? allowed : [allowed]
  return roles.includes(session.user.role)
}

// ---------------------------------------------------------------------------
// Named role guards required by the assignment brief.
// ---------------------------------------------------------------------------

/** Any authenticated user. */
export async function verifyStudent() {
  return requireApiRole("student")
}

export async function verifyTutor() {
  return requireApiRole("tutor")
}

export async function verifyAdmin() {
  return requireApiRole("admin")
}

// ---------------------------------------------------------------------------
// API-route oriented helpers (return a status instead of redirecting).
// ---------------------------------------------------------------------------

/** Verify the token and return a discriminated result for route handlers. */
export async function getApiSession(): Promise<VerifyResult> {
  const session = await verifyToken()
  if (!session) {
    return { ok: false, status: 401, error: "Unauthenticated" }
  }
  return { ok: true, session }
}

/**
 * Verify the token and enforce role membership for an API route.
 *
 * Usage:
 *   const auth = await requireApiRole("tutor")
 *   if (!auth.ok) return jsonError(auth.error, auth.status)
 */
export async function requireApiRole(
  allowed: Role | Role[]
): Promise<VerifyResult> {
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

// Backwards-compatible alias.
export const requireApiSession = getApiSession
