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

  // Profile fields: the role chosen on Sign Up plus phone/bio, which are
  // editable from the Update Profile page.
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        options: ["student", "tutor"],
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
    // Allow changing the email from the Update Profile page. Email/password
    // accounts are not verified, so the new address is applied immediately.
    changeEmail: {
      enabled: true,
      updateEmailWithoutVerification: true,
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
