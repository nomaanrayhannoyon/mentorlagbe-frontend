import { requireRole } from "@/lib/authHelper"
import { BookmarksList } from "@/components/dashboard/bookmarks-list"

export const metadata = { title: "Saved Tuitions" }

export default async function BookmarksPage() {
  await requireRole(["student", "tutor", "admin"])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          Saved Tuitions
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tuitions you have bookmarked for later.
        </p>
      </header>

      <BookmarksList />
    </div>
  )
}