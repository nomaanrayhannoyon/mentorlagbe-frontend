import type { Document, ObjectId } from "mongodb"
import { getDb } from "@/lib/db"

/**
 * Domain collections.
 *
 * The assignment's "four collections" are:
 *   - user         (better-auth managed, plus a role field)
 *   - tuitions     (tutor posts, moderated by admin)
 *   - applications (student → tuition)
 *   - payments     (Stripe checkout records)
 *
 * `bookmarks` is an auxiliary collection for saved tuitions.
 */

export type Role = "student" | "tutor" | "admin"
export type TuitionStatus = "pending" | "approved" | "rejected"
export type TuitionMode = "online" | "in-person"
export type ApplicationStatus =
  "pending" | "accepted" | "rejected" | "withdrawn"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

/** A tuition document as stored in Mongo. */
export type Tuition = {
  _id: ObjectId
  title: string
  description: string
  subject: string
  /** Class / level label, e.g. "Class 9", "HSC", "University". */
  level: string
  mode: TuitionMode
  /** Required when mode === "in-person". */
  location?: string
  price: number
  /** ISO date string (YYYY-MM-DD) or free-form schedule text. */
  schedule?: string
  /** ImgBB URL. */
  image?: string
  tutorId: string
  tutorName?: string
  status: TuitionStatus
  /** Admin note when rejecting. */
  moderationNote?: string
  createdAt: Date
  updatedAt: Date
}

export type Application = {
  _id: ObjectId
  tuitionId: string
  studentId: string
  studentName?: string
  message: string
  status: ApplicationStatus
  createdAt: Date
  updatedAt: Date
}

export type Payment = {
  _id: ObjectId
  tuitionId?: string
  userId: string
  /** Stripe checkout session id. */
  stripeSessionId?: string
  amount: number
  currency: string
  status: PaymentStatus
  plan?: "pro" | "free"
  createdAt: Date
}

export type Bookmark = {
  _id: ObjectId
  userId: string
  tuitionId: string
  createdAt: Date
}

/** Public user shape returned by the API (never exposes passwordHash). */
export type UserProfile = {
  _id: string
  name: string
  email: string
  emailVerified: boolean
  role: Role
  phone?: string
  bio?: string
  image?: string | null
  createdAt?: Date
}

export async function getCollection<T extends Document = Document>(
  name: CollectionName
) {
  const db = await getDb()
  return db.collection<T>(name)
}

export type CollectionName =
  "user" | "tuitions" | "applications" | "payments" | "bookmarks"

export const Collections = {
  users: "user",
  tuitions: "tuitions",
  applications: "applications",
  payments: "payments",
  bookmarks: "bookmarks",
} as const satisfies Record<string, CollectionName>
