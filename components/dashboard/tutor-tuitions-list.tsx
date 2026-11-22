"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  GraduationCap,
  Power,
} from "lucide-react"
import { toast } from "sonner"

import { apiFetch, ApiError } from "@/lib/api-client"
import type { Tuition, TuitionStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { DeleteTuitionDialog } from "@/components/dashboard/delete-tuition-dialog"

const statusVariant: Record<
  TuitionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
}

const statusLabel: Record<TuitionStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
}

export function TutorTuitionsList() {
  const [items, setItems] = useState<Tuition[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Tuition | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ items: Tuition[] }>("/api/tuitions/mine")
      setItems(data.items)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not load tuitions."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const handleDeleted = () => {
    setDeleteTarget(null)
    toast.success("Tuition deleted.")
    void load()
  }

  const handleToggleActive = async (tuition: Tuition) => {
    try {
      await apiFetch(`/api/tuitions/${tuition._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: tuition.isActive === false }),
      })
      toast.success(
        tuition.isActive === false ? "Tuition reopened." : "Tuition closed."
      )
      void load()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update tuition."
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Loading tuitions…
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-12 text-center">
        <GraduationCap className="size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No tuitions yet</h3>
        <p className="text-sm text-muted-foreground">
          Post your first tuition to start receiving applications.
        </p>
        <Link
          href="/dashboard/tuitions/new"
          className={cn(buttonVariants({}), "mt-2")}
        >
          <Plus /> Post a tuition
        </Link>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {items.map((tuition) => (
          <Card key={tuition._id} className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{tuition.title}</h3>
                  <Badge variant={statusVariant[tuition.status]}>
                    {statusLabel[tuition.status]}
                  </Badge>
                  {tuition.status === "approved" &&
                    tuition.isActive === false && (
                      <Badge variant="outline">Closed</Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {tuition.subject} · {tuition.level} · {tuition.mode} · ৳
                  {tuition.price}
                </p>
                {tuition.status === "rejected" && tuition.moderationNote && (
                  <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    Note from admin: {tuition.moderationNote}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                {tuition.status === "approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleActive(tuition)}
                  >
                    <Power className="size-4" />
                    {tuition.isActive === false ? "Reopen" : "Close"}
                  </Button>
                )}
                <Link
                  href={`/dashboard/tuitions/${tuition._id}/edit`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" })
                  )}
                >
                  <Pencil className="size-4" /> Edit
                </Link>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteTarget(tuition)}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <DeleteTuitionDialog
        tuition={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={handleDeleted}
      />
    </>
  )
}
