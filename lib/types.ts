/**
 * Client-safe mirror of the domain types from lib/collections.ts.
 *
 * We can't import lib/collections.ts into client components because it
 * pulls in the Mongo driver. These types are structurally identical but
 * use `string` for ObjectId (as serialized by the API).
 */

export type Role = "student" | "tutor" | "admin"
export type Plan = "free" | "pro"
export type TuitionStatus = "pending" | "approved" | "rejected"
export type TuitionMode = "online" | "in-person"
export type ApplicationStatus =
  "pending" | "accepted" | "rejected" | "withdrawn"
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded"

export type Tuition = {
  _id: string
  title: string
  description: string
  subject: string
  level: string
  mode: TuitionMode
  location?: string
  price: number
  schedule?: string
  image?: string
  tutorId: string
  tutorName?: string
  status: TuitionStatus
  isActive?: boolean
  moderationNote?: string
  createdAt: string
  updatedAt: string
}

export type ApplicationTuition = {
  title: string
  subject: string
  level: string
  mode: TuitionMode
  price: number
}

export type Application = {
  _id: string
  tuitionId: string
  studentId: string
  studentName?: string
  message: string
  status: ApplicationStatus
  /** Joined tuition summary from GET /api/applications. */
  tuition?: ApplicationTuition
  createdAt: string
  updatedAt: string
}

export type Payment = {
  _id: string
  tuitionId?: string
  userId: string
  stripeSessionId?: string
  amount: number
  currency: string
  status: PaymentStatus
  plan?: Plan
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
