/**
 * Client-safe mirror of the domain types from lib/collections.ts.
 *
 * We can't import lib/collections.ts into client components because it
 * pulls in the Mongo driver. These types are structurally identical but
 * use `string` for ObjectId (as serialized by the API).
 *
 * Field names follow the assignment's logical database design exactly
 * (classLevel, monthlyFee, daysPerWeek, bannerImage, approvalStatus,
 * preferredSchedule, studentNote, transactionId, paymentStatus, …).
 */

export type Role = "student" | "tutor" | "admin"
export type Plan = "free" | "pro"
export type TuitionStatus = "pending" | "approved" | "rejected"
export type TuitionMode = "Online" | "Offline"
export type ApplicationStatus = "pending" | "accepted" | "rejected"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export type Tuition = {
  _id: string
  title: string
  description: string
  subject: string
  classLevel: string
  mode: TuitionMode
  location?: string
  monthlyFee: number
  daysPerWeek?: number
  bannerImage?: string
  tutorId: string
  tutorName?: string
  tutorEmail?: string
  approvalStatus: TuitionStatus
  isActive?: boolean
  moderationNote?: string
  createdAt: string
  updatedAt: string
}

export type Application = {
  _id: string
  tuitionId: string
  /** Denormalised tuition summary written at application time. */
  tuitionTitle: string
  subject: string
  monthlyFee: number
  tutorName?: string
  tutorEmail: string
  studentId: string
  studentName: string
  studentEmail: string
  studentPhone: string
  preferredSchedule?: string
  studentNote?: string
  status: ApplicationStatus
  appliedAt: string
  updatedAt: string
}

export type Payment = {
  _id: string
  userId: string
  userEmail: string
  userName: string
  userRole: Role
  planName?: string
  amount: number
  currency: string
  transactionId?: string
  stripeSessionId?: string
  paymentStatus: PaymentStatus
  paidAt?: string
  createdAt: string
}

export type UserProfile = {
  _id: string
  name: string
  email: string
  emailVerified: boolean
  role: Role
  plan?: Plan
  phone?: string
  bio?: string
  image?: string | null
  savedTuitions?: string[]
  createdAt?: string
}

export type TuitionListResponse = {
  items: Tuition[]
  page: number
  limit: number
  total: number
  totalPages: number
}
