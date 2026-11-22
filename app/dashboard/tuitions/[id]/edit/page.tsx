import { notFound, redirect } from "next/navigation"
import { ObjectId } from "mongodb"

import { requireRole } from "@/lib/authHelper"
import { getCollection, Collections, type Tuition } from "@/lib/collections"
import { TuitionForm } from "@/components/dashboard/tuition-form"
import type { Tuition as ClientTuition } from "@/lib/types"

export const metadata = { title: "Edit Tuition" }

function toClient(t: Tuition): ClientTuition {
  return {
    _id: t._id.toString(),
    title: t.title,
    description: t.description,
    subject: t.subject,
    level: t.level,
    mode: t.mode,
    location: t.location,
    price: t.price,
    schedule: t.schedule,
    image: t.image,
    tutorId: t.tutorId,
    tutorName: t.tutorName,
    status: t.status,
    moderationNote: t.moderationNote,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

export default async function EditTuitionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await requireRole("tutor")
  const { id } = await params

  let objectId: ObjectId
  try {
    objectId = new ObjectId(id)
  } catch {
    notFound()
  }

  const col = await getCollection<Tuition>(Collections.tuitions)
  const tuition = await col.findOne({ _id: objectId })
  if (!tuition) notFound()

  // Tutors can only edit their own tuitions.
  if (tuition.tutorId !== session.user.id) {
    redirect("/dashboard/tuitions")
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Edit Tuition
        </h1>
        <p className="mt-1 text-muted-foreground">
          Changes will be sent back for admin approval.
        </p>
      </header>

      <TuitionForm tuition={toClient(tuition)} />
    </div>
  )
}