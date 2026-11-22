"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Bookmark, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { apiFetch, ApiError } from "@/lib/api-client"
import type { Tuition } from "@/lib/types"
import { TuitionCard } from "@/components/tuition-card"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function BookmarksList() {
  const [items, setItems] = useState<Tuition[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const bm = await apiFetch<{ tuitionIds: string[] }>("/api/bookmarks")
      if (bm.tuitionIds.length === 0) {
        setItems([])
        return
      }
      // Fetch each tuition by id.
      const results = await Promise.all(
        bm.tuitionIds.map((id) =>
          apiFetch<Tuition>(`/api/tuitions/${id}`).catch(() => null)
        )
      )
      setItems(results.filter((t): t is Tuition => t !== null))
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not load saved tuitions."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Loading saved tuitions…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-12 text-center">
        <Bookmark className="size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No saved tuitions</h3>
        <p className="text-sm text-muted-foreground">
          Tap the bookmark on any tuition to save it here.
        </p>
        <Link
          href="/tuitions"
          className={cn(buttonVariants({ variant: "outline" }), "mt-2")}
        >
          Browse tuitions
        </Link>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((tuition) => (
        <TuitionCard key={tuition._id} tuition={tuition} />
      ))}
    </div>
  )
}
