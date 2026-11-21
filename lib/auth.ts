import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

const client = new MongoClient(process.env.MONGODB_URI as string)
const db = client.db("mentorlagbe")

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    // Must match the client-side validation on the Sign Up page.
    minPasswordLength: 8,
  },

  

  // Persist the role chosen on the Sign Up form (student | tutor).
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        options:["student","tutor"],
        input: true,
      },
    },
  },

  // google login
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // google login

  database: mongodbAdapter(db, {
    client,
  }),
})
