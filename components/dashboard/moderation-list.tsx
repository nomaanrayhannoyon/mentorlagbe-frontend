"use client"

import { useEffect, useState, useCallback } from "react"
import { Check, X, Loader2, ShieldCheck, ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { apiFetch, ApiError } from "@/lib/api-client"
import type { Tuition, TuitionStatus } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const statusVariant: Record<
  TuitionStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  approved: "default",
  rejected: "destructive",
}

const statusLabel: Record<TuitionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
}

const FILTERS: Array<{ value: "" | TuitionStatus; label: string }> = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
]

export function ModerationList() {
  const [items, setItems] = useState<Tuition[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<"" | TuitionStatus>("pending")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const qs = status ? `?status=${status}` : ""
      const data = await apiFetch<{ items: Tuition[] }>(
        `/api/admin/tuitions${qs}`
      )
      setItems(data.items)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not load tuitions."
      )
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    void load()
  }, [load])

  const review = async (
    tuition: Tuition,
    nextStatus: "approved" | "rejected",
    note?: string
  ) => {
    setBusyId(tuition._id)
    try {
      await apiFetch(`/api/admin/tuitions/${tuition._id}/review`, {
        method: "POST",
        body: { status: nextStatus, moderationNote: note },
      })
      toast.success(
        nextStatus === "approved" ? "Tuition approved." : "Tuition rejected."
      )
      setRejectingId(null)
      setRejectNote("")
      await load()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Review failed."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              status === f.value
                ? "border-burgundy-600 bg-burgundy-600 text-white"
                : "border-input hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> Loading…
        </div>
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <ShieldCheck className="size-10 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Nothing to review</h3>
          <p className="text-sm text-muted-foreground">
            There are no {status || "matching"} tuitions right now.
          </p>
        </Card>
      ) : (
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
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tuition.subject} · {tuition.level} · {tuition.mode}
                    {tuition.location ? ` · ${tuition.location}` : ""} · ৳
                    {tuition.price}
                  </p>
                  <p className="text-sm text-foreground/80">
                    {tuition.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    By {tuition.tutorName ?? "Tutor"} ·{" "}
                    {new Date(tuition.createdAt).toLocaleDateString()}
                  </p>
                  {tuition.image && (
                    <a
                      href={tuition.image}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-burgundy-600 hover:underline"
                    >
                      <ImageIcon className="size-4" /> View image
                    </a>
                  )}
                </div>

                {tuition.status === "pending" && (
                  <div className="flex shrink-0 flex-col gap-2">
                    {rejectingId === tuition._id ? (
                      <>
                        <Textarea
                          value={rejectNote}
                          onChange={(e) => setRejectNote(e.target.value)}
                          placeholder="Reason for rejection (optional)"
                          rows={3}
                          className="w-56 rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busyId === tuition._id}
                            onClick={() => review(tuition, "rejected", rejectNote)}
                          >
                            Confirm reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRejectingId(null)
                              setRejectNote("")
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          disabled={busyId === tuition._id}
                          onClick={() => review(tuition, "approved")}
                        >
                          <Check className="size-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={busyId === tuition._id}
                          onClick={() => setRejectingId(tuition._id)}
                        >
                          <X className="size-4" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}