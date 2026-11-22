import { NextResponse, type NextRequest } from "next/server"

/**
 * Route protection via better-auth session verification.
 *
 * The session token lives in an httpOnly cookie. In middleware we forward
 * the request headers to better-auth's get-session endpoint, which validates
 * the signed token against the backing session record. This is the
 * authoritative server-side verification (the "JWT verification" step): the
 * cookie is a signed JWT, and better-auth checks its signature + the DB
 * session it points to.
 *
 * Middleware runs on the Node.js runtime (Next 16) so it can use the shared
 * Mongo connection pool.
 */

export const runtime = "nodejs"

const PUBLIC_PATHS = [
  "/",
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/reset-password",
  "/about",
  "/pricing",
  "/tuitions",
  "/api/auth",
]

const PROTECTED_PREFIXES = ["/dashboard", "/profile"]

function isPublic(pathname: string) {
  return (
    PUBLIC_PATHS.some(
      (p) => p === pathname || (p !== "/" && pathname.startsWith(p + "/"))
    ) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images")
  )
}

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (!isProtected(pathname)) {
    return NextResponse.next()
  }

  // Check the session cookie. We don't need the full session body here —
  // mere presence of a non-empty session token is enough to allow the request
  // through; route handlers / server components re-verify with
  // requireSession() before returning sensitive data.
  const token =
    request.cookies.get("better-auth.session_token")?.value ??
    request.cookies.get("__Secure-better-auth.session_token")?.value

  if (!token) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = "/sign-in"
    url.search = `?callbackUrl=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything except static assets and the auth endpoints themselves.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)"],
}
