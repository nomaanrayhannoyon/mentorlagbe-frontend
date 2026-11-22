import { requireRole } from "@/lib/authHelper"
import { TuitionForm } from "@/components/dashboard/tuition-form"

export const metadata = { title: "Post a Tuition" }

export default async function NewTuitionPage() {
  await requireRole("tutor")

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Post a Tuition
        </h1>
        <p className="mt-1 text-muted-foreground">
          Share your expertise. Approved tuitions are visible to all students.
        </p>
      </header>

      <TuitionForm />
    </div>
  )
}
