import type { Document, ObjectId } from "mongodb"
import { getDb } from "@/lib/db"

/**
 * Domain collections.
 *
 * The assignment mandates exactly four collections:
 *
 *   1. users        — better-auth managed (usePlural: true) + role/plan/profile
 *   2. tuitions     — tutor posts, moderated by admin
 *   3. applications — student → tuition
 *   4. payments     — Stripe checkout / subscription records
 *
 * Bookmarks are stored as an array field on the user document
 * (`savedTuitions: string[]`) so no fifth collection is introduced.
 *
 * (better-auth also creates `sessions`, `accounts` and `verifications`;
 * those are framework-managed auth infrastructure, not domain collections.)
 */

export type Role = "student" | "tutor" | "admin"
export type TuitionStatus = "pending" | "approved" | "rejected"
/** Spec: mode ('Online' | 'Offline'). */
export type TuitionMode = "Online" | "Offline"
/** Spec: status ('pending' | 'accepted' | 'rejected'). */
export type ApplicationStatus = "pending" | "accepted" | "rejected"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"
export type Plan = "free" | "pro"

/** A tuition document as stored in Mongo (spec field names). */
export type Tuition = {
  _id: ObjectId
  title: string
  description: string
  subject: string
  /** Spec: classLevel, e.g. "Class 9", "HSC", "University". */
  classLevel: string
  mode: TuitionMode
  /** Required when mode === "Offline". */
  location?: string
  /** Spec: monthlyFee (BDT per month). */
  monthlyFee: number
  /** Spec: daysPerWeek, 1–7. */
  daysPerWeek?: number
  /** Spec: bannerImage — ImgBB URL. */
  bannerImage?: string
  tutorId: string
  tutorName?: string
  tutorEmail?: string
  /** Spec: approvalStatus ('pending' | 'approved' | 'rejected'). */
  approvalStatus: TuitionStatus
  /** Whether the tutor is still accepting applications. */
  isActive: boolean
  /** Admin note when rejecting. */
  moderationNote?: string
  createdAt: Date
  updatedAt: Date
}

export type Application = {
  _id: ObjectId
  tuitionId: string
  /** Denormalised tuition summary (spec fields). */
  tuitionTitle: string
  subject: string
  monthlyFee: number
  tutorEmail: string
  studentId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  /** Spec: preferredSchedule. */
  preferredSchedule?: string
  /** Spec: studentNote. */
  studentNote?: string
  status: ApplicationStatus
  /** Spec: appliedAt. */
  appliedAt: Date
  updatedAt: Date
}

export type Payment = {
  _id: ObjectId
  userId: string
  /** Spec: userEmail / userName / userRole. */
  userEmail: string
  userName: string
  userRole: Role
  /** Spec: planName, e.g. "Pro Tutor", "Pro Student". */
  planName?: string
  amount: number
  currency: string
  /** Spec: transactionId (Stripe payment intent id). */
  transactionId?: string
  /** Spec: stripeSessionId. */
  stripeSessionId?: string
  /** Stripe subscription id (recurring plans). */
  stripeSubscriptionId?: string
  /** Spec: paymentStatus ('paid' after webhook confirmation). */
  paymentStatus: PaymentStatus
  /** Spec: paidAt. */
  paidAt?: Date
  createdAt: Date
}

/**
 * The `users` collection. better-auth owns identity fields (id, email,
 * name, password hash in `accounts`); the rest are app-owned.
 */
export type UserDocument = {
  _id: ObjectId
  name: string
  email: string
  emailVerified: boolean
  role: Role
  plan: Plan
  phone?: string
  bio?: string
  image?: string | null
  /** Tuition ids the user bookmarked. Replaces a separate collection. */
  savedTuitions?: string[]
  createdAt?: Date
  updatedAt?: Date
}

/** Public user shape returned by the API (never exposes password hashes). */
export type UserProfile = {
  _id: string
  name: string
  email: string
  emailVerified: boolean
  role: Role
  plan: Plan
  phone?: string
  bio?: string
  image?: string | null
  savedTuitions?: string[]
  createdAt?: Date
}

export async function getCollection<T extends Document = Document>(
  name: CollectionName
) {
  const db = await getDb()
  return db.collection<T>(name)
}

export type CollectionName = "users" | "tuitions" | "applications" | "payments"

export const Collections = {
  users: "users",
  tuitions: "tuitions",
  applications: "applications",
  payments: "payments",
} as const satisfies Record<string, CollectionName>

/**
 * The four required collection names, exported for the audit / admin stats.
 */
export const REQUIRED_COLLECTIONS = [
  Collections.users,
  Collections.tuitions,
  Collections.applications,
  Collections.payments,
] as const
