import { createAuthClient } from "better-auth/react"
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL,
})

export const { signIn, signUp, useSession } = createAuthClient()

/**
 * The session user returned by `authClient.useSession()`, including the
 * additional fields configured in `lib/auth.ts` (role, phone, bio).
 */
export type AuthUser = {
  id: string
  name: string
  email: string
  image?: string | null
  emailVerified?: boolean
  role?: string
  phone?: string
  bio?: string
}
