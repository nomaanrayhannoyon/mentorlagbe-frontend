"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Bookmark, Globe, MapPin } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { apiFetch, ApiError } from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"
import type { Tuition } from "@/lib/types"

function TuitionCard({ tuition }: { tuition: Tuition }) {
  const { data: session } = authClient.useSession()
  const userId = session?.user?.id

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const isOnline = tuition.mode === "online"

  // Load bookmark state when the user signs in.
  useEffect(() => {
    if (!userId) {
      setSaved(false)
      return
    }
    let cancelled = false
    apiFetch<{ tuitionIds: string[] }>("/api/bookmarks")
      .then((res) => {
        if (!cancelled) setSaved(res.tuitionIds.includes(tuition._id))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [userId, tuition._id])

  const toggleSave = async () => {
    if (!userId) {
      toast.error("Sign in to save tuitions.")
      return
    }
    if (saving) return
    setSaving(true)
    try {
      if (saved) {
        await apiFetch(`/api/bookmarks/${tuition._id}`, { method: "DELETE" })
        setSaved(false)
        toast.success("Removed from saved tuitions.")
      } else {
        await apiFetch("/api/bookmarks", {
          method: "POST",
          body: { tuitionId: tuition._id },
        })
        setSaved(true)
        toast.success("Saved for later.")
      }
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update bookmark."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="group gap-3 p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-burgundy-500/40">
      <div className="relative overflow-hidden rounded-xl">
        <Link href={`/tuitions/${tuition._id}`}>
          {tuition.image ? (
            <Image
              src={tuition.image}
              alt={`${tuition.subject} tuition session`}
              width={800}
              height={400}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="aspect-[2/1] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex aspect-[2/1] w-full items-center justify-center bg-gradient-to-br from-burgundy-50 to-burgundy-100 text-burgundy-400 dark:from-burgundy-950 dark:to-burgundy-900">
              <span className="text-lg font-bold">{tuition.subject}</span>
            </div>
          )}
        </Link>

        {/* Mode badge */}
        <Badge
          variant="outline"
          className={cn(
            "absolute top-2.5 left-2.5 h-auto px-3 py-1.5 shadow-sm backdrop-blur",
            isOnline
              ? "border-transparent bg-burgundy-600 text-white"
              : "border-transparent bg-black/75 text-white"
          )}
        >
          {isOnline ? (
            <Globe aria-hidden />
          ) : (
            <MapPin aria-hidden className="text-burgundy-400" />
          )}
          {isOnline ? "Online" : tuition.location}
        </Badge>

        {/* Bookmark toggle */}
        <button
          type="button"
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${tuition.subject} from saved tuitions`
              : `Save ${tuition.subject}`
          }
          disabled={saving}
          onClick={toggleSave}
          className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition-colors hover:bg-black/90 focus-visible:ring-2 focus-visible:ring-burgundy-400 focus-visible:outline-none disabled:opacity-60"
        >
          <Bookmark
            aria-hidden
            className={cn("size-4", saved && "fill-current")}
          />
        </button>
      </div>

      {/* Subject + class level + title */}
      <div className="space-y-2 px-1 pb-1">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="h-auto rounded-lg border-burgundy-500/40 bg-burgundy-500/10 px-3 py-1.5 text-burgundy-700 dark:text-burgundy-300"
          >
            {tuition.subject}
          </Badge>
          <span className="truncate text-right text-sm text-muted-foreground">
            {tuition.level}
          </span>
        </div>
        <Link
          href={`/tuitions/${tuition._id}`}
          className="block truncate font-semibold hover:text-burgundy-600"
        >
          {tuition.title}
        </Link>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-burgundy-600 dark:text-burgundy-400">
            ৳{tuition.price.toLocaleString()}
          </span>
          {tuition.tutorName && (
            <span className="truncate text-xs text-muted-foreground">
              by {tuition.tutorName}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

export { TuitionCard }
