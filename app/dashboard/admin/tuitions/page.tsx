import { requireRole } from "@/lib/authHelper"
import { ModerationList } from "@/components/dashboard/moderation-list"

export const metadata = { title: "Moderation" }

export default async function AdminTuitionsPage() {
  await requireRole("admin")

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Tuition Moderation
        </h1>
        <p className="mt-1 text-muted-foreground">
          Review, approve or reject tuition posts submitted by tutors.
        </p>
      </header>

      <ModerationList />
    </div>
  )
}