import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { jwt } from "better-auth/plugins"
import { getMongoClient } from "@/lib/db"

/**
 * better-auth configuration.
 *
 * Uses the shared MongoClient from lib/db.ts (one connection pool for the
 * whole app). The Mongo Node driver connects lazily on the first operation,
 * so we can hand `client.db(...)` to the adapter synchronously without
 * awaiting an explicit connect() here.
 */

const client = getMongoClient()
const db = client.db(process.env.MONGODB_DB ?? "mentorlagbe")

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

// Base URL of the app. In production this MUST be the public origin
// (e.g. https://mentorlagbe.example.com) so better-auth builds the correct
// OAuth callback URL (https://<origin>/api/auth/callback/google) and sets the
// right cookie/redirect behaviour. In development it is http://localhost:3000.
const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL

// Extra origins (comma-separated) that are allowed to call the auth API,
// e.g. a separately hosted frontend. The base URL is always trusted.
const TRUSTED_ORIGINS = (process.env.TRUSTED_ORIGINS ?? process.env.CORS_ALLOWED_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

const trustedOrigins = [BETTER_AUTH_URL, ...TRUSTED_ORIGINS].filter(
  Boolean
) as string[]

export const auth = betterAuth({
  // Explicit base URL so callback/redirect URLs are correct in both dev and
  // production (falls back to better-auth's request-based inference if unset).
  baseURL: BETTER_AUTH_URL,
  ...(trustedOrigins.length ? { trustedOrigins } : {}),

  database: mongodbAdapter(db, {
    // `client` enables multi-document transactions (Atlas replica set).
    client,
    // Assignment requires the collection be named `users` (plural).
    usePlural: true,
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: false,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: true,
      },
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        // Plan is only ever changed by the Stripe webhook, never by the client.
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
    },
    changeEmail: {
      enabled: true,
      // Require verification before switching email — safer for production.
      updateEmailWithoutVerification: false,
    },
  },

  // Google OAuth is only enabled when credentials are present, so the app
  // builds and runs cleanly without them (the "Continue with Google" buttons
  // surface a friendly error if clicked while unconfigured).
  socialProviders: GOOGLE_CLIENT_ID
    ? {
        google: {
          clientId: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET as string,
        },
      }
    : undefined,

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once a day
  },

  // Enables the JWT plugin so the app can issue/verify signed JWTs in
  // addition to the default session cookie. Satisfies the assignment's
  // "JWT verification" requirement: the same session token is verifiable
  // server-side both as a cookie (middleware) and as a JWT (API clients).
  plugins: [jwt()],
})

export type Auth = typeof auth
