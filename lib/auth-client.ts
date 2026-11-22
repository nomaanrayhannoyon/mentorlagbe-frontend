import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"

/**
 * Single, configured auth client.
 *
 * `baseURL` is read from BETTER_AUTH_URL so the client works in production
 * (where the app is not necessarily served from the auth origin). In
 * development BETTER_AUTH_URL is typically http://localhost:3000.
 *
 * `inferAdditionalFields` pulls the server-side additionalFields
 * (role, phone, bio) into the client types, so call sites no longer need
 * `as Parameters<...>` casts.
 */
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false, input: true },
        phone: { type: "string", required: false, input: true },
        bio: { type: "string", required: false, input: true },
      },
    }),
  ],
})

export const { signIn, signUp, signOut, useSession, getSession } = authClient

/** Session user returned by `authClient.useSession()`, including additional fields. */
export type AuthUser = {
  id: string
  name: string
  email: string
  image?: string | null
  emailVerified?: boolean
  role?: "student" | "tutor" | "admin"
  phone?: string
  bio?: string
}
