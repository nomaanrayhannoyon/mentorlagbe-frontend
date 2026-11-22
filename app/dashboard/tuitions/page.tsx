import Link from "next/link"
import { Plus } from "lucide-react"

import { requireRole } from "@/lib/authHelper"
import { TutorTuitionsList } from "@/components/dashboard/tutor-tuitions-list"
import { Button } from "@/components/ui/button"

export const metadata = { title: "My Tuitions" }

export default async function TutorTuitionsPage() {
  await requireRole("tutor")

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            My Tuitions
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage the tuitions you have posted.
          </p>
        </div>
        <Link href="/dashboard/tuitions/new">
          <Button>
            <Plus /> Post a tuition
          </Button>
        </Link>
      </header>

      <TutorTuitionsList />
    </div>
  )
}