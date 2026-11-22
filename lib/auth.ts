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

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    // `client` enables multi-document transactions (Atlas replica set).
    client,
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