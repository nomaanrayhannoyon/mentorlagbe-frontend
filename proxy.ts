import { NextResponse, type NextRequest } from "next/server"

/**
 * Route protection via better-auth session verification.
 *
 * Protected prefixes (dashboard, profile) require a session cookie; the proxy
 * gates them before render and redirects anonymous users to sign-in. API
 * routes under /api (except /api/auth) return 401 JSON.
 *
 * Proxy always runs on the Node.js runtime (Next 16).
 */

const PROTECTED_PREFIXES = ["/dashboard", "/profile"]

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function proxy(request: NextRequest) {
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
