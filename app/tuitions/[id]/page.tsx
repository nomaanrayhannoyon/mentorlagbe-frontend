import { notFound } from "next/navigation"
import { ObjectId } from "mongodb"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Globe,
  Calendar,
  User,
  CheckCircle2,
} from "lucide-react"

import { getCollection, Collections, type Tuition } from "@/lib/collections"
import { verifyToken } from "@/lib/authHelper"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ApplyButton } from "@/components/tuitions/apply-button"
import { cn } from "@/lib/utils"

export const metadata = { title: "Tuition Details" }

export default async function TuitionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
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

  // Only approved, still-active tuitions are publicly visible.
  if (tuition.status !== "approved" || tuition.isActive === false) {
    notFound()
  }

  // Load tutor profile (best-effort).
  let tutor: { bio?: string } | null = null
  try {
    const tutorObjectId = new ObjectId(tuition.tutorId)
    const users = await getCollection<Record<string, unknown>>(
      Collections.users
    )
    tutor = (await users.findOne({
      _id: tutorObjectId,
    })) as unknown as { bio?: string } | null
  } catch {
    tutor = null
  }

  const session = await verifyToken()
  const userId = session?.user.id
  const role = session?.user.role
  const isOwner = userId === tuition.tutorId

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/tuitions"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to tuitions
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main column */}
          <div className="space-y-6">
            {/* Cover image */}
            {tuition.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tuition.image}
                alt={tuition.title}
                className="aspect-[2/1] w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex aspect-[2/1] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-burgundy-50 to-burgundy-100 text-burgundy-400 dark:from-burgundy-950 dark:to-burgundy-900">
                <span className="text-2xl font-bold">{tuition.subject}</span>
              </div>
            )}

            {/* Title + meta */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-burgundy-500/40 bg-burgundy-500/10 px-3 py-1.5 text-burgundy-700 dark:text-burgundy-300"
                >
                  {tuition.subject}
                </Badge>
                <Badge variant="secondary">{tuition.level}</Badge>
                <Badge variant="outline" className="gap-1">
                  {tuition.mode === "online" ? (
                    <Globe className="size-3" />
                  ) : (
                    <MapPin className="size-3" />
                  )}
                  {tuition.mode === "online"
                    ? "Online"
                    : (tuition.location ?? "In person")}
                </Badge>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {tuition.title}
              </h1>
              {tuition.tutorName && (
                <p className="flex items-center gap-2 text-muted-foreground">
                  <User className="size-4" /> Taught by{" "}
                  <span className="font-medium text-foreground">
                    {tuition.tutorName}
                  </span>
                </p>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="mb-3 text-lg font-semibold">About this tuition</h2>
              <p className="leading-7 whitespace-pre-wrap text-foreground/80">
                {tuition.description}
              </p>
            </div>

            {tuition.schedule && (
              <div className="flex items-start gap-3 rounded-xl bg-muted/50 p-4">
                <Calendar className="mt-0.5 size-5 shrink-0 text-burgundy-600" />
                <div>
                  <p className="text-sm font-semibold">Schedule</p>
                  <p className="text-sm text-muted-foreground">
                    {tuition.schedule}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: price + apply */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Card className="space-y-5 p-6">
              <div>
                <p className="text-sm text-muted-foreground">Monthly fee</p>
                <p className="text-3xl font-extrabold text-burgundy-600 dark:text-burgundy-400">
                  ৳{(tuition.price ?? 0).toLocaleString()}
                </p>
              </div>

              {isOwner ? (
                <Link
                  href={`/dashboard/tuitions/${tuition._id}/edit`}
                  className={cn(buttonVariants({ className: "w-full" }))}
                >
                  Edit your tuition
                </Link>
              ) : role === "student" ? (
                <ApplyButton tuitionId={tuition._id.toString()} />
              ) : !userId ? (
                <Link
                  href="/sign-in"
                  className={cn(buttonVariants({ className: "w-full" }))}
                >
                  Sign in to apply
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Switch to a student account to apply.
                </p>
              )}

              <Separator />

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-600" />
                  Admin-reviewed listing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-600" />
                  Direct communication with tutor
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-green-600" />
                  Track application in dashboard
                </li>
              </ul>

              {tutor?.bio && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-1 text-sm font-semibold">
                      About the tutor
                    </p>
                    <p className="text-sm text-muted-foreground">{tutor.bio}</p>
                  </div>
                </>
              )}
            </Card>
          </aside>
        </div>
      </div>
    </main>
  )
}
