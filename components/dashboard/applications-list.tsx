"use client"

import { useEffect, useState, useCallback } from "react"
import { ClipboardList, Check, X, Loader2, Clock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { apiFetch, ApiError } from "@/lib/api-client"
import type { Application } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const statusVariant: Record<
  Application["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  accepted: "default",
  rejected: "destructive",
}

const statusLabel: Record<Application["status"], string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
}

type Mode = "student" | "tutor" | "admin"

const COPY: Record<Mode, { title: string; empty: string; hint: string }> = {
  student: {
    title: "My applications",
    empty: "Browse tuitions and apply to ones you like.",
    hint: "Track the status of tuitions you have applied to.",
  },
  tutor: {
    title: "Applications to your tuitions",
    empty: "Applications from students will appear here.",
    hint: "Review and manage students who applied to your tuitions.",
  },
  admin: {
    title: "All applications",
    empty: "No applications have been submitted yet.",
    hint: "Review and moderate every application on the platform.",
  },
}

export function ApplicationsList({ mode }: { mode: Mode }) {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch<{ items: Application[] }>("/api/applications")
      setApps(data.items)
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not load applications."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const act = async (app: Application, action: "accept" | "reject") => {
    setBusyId(app._id)
    try {
      await apiFetch(`/api/applications/${app._id}`, {
        method: "PATCH",
        body: { action },
      })
      toast.success(
        action === "accept" ? "Application accepted." : "Application rejected."
      )
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Action failed.")
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" /> Loading applications…
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 p-12 text-center">
        <ClipboardList className="size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No applications yet</h3>
        <p className="text-sm text-muted-foreground">{COPY[mode].empty}</p>
        {mode === "student" && (
          <Link href="/tuitions" className="mt-2">
            <Button variant="outline">Browse tuitions</Button>
          </Link>
        )}
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {apps.map((app) => {
        const isPending = app.status === "pending"
        return (
          <Card key={app._id} className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{app.tuitionTitle}</h3>
                  <Badge variant={statusVariant[app.status]}>
                    {statusLabel[app.status]}
                  </Badge>
                </div>
                {mode === "tutor" && (
                  <p className="text-sm text-muted-foreground">
                    Applicant:{" "}
                    <span className="font-medium text-foreground">
                      {app.studentName ?? "Student"}
                    </span>
                  </p>
                )}
                {mode === "admin" && (
                  <p className="text-sm text-muted-foreground">
                    Applicant:{" "}
                    <span className="font-medium text-foreground">
                      {app.studentName ?? "Student"}
                    </span>
                    {" · "}
                    {app.subject} · ৳{app.monthlyFee}
                  </p>
                )}
                {mode === "student" && (
                  <p className="text-sm text-muted-foreground">
                    Subject: {app.subject} · ৳{app.monthlyFee}
                  </p>
                )}
                {app.studentNote && (
                  <p className="rounded-lg bg-muted/50 p-3 text-sm text-foreground/80">
                    {app.studentNote}
                  </p>
                )}
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  {new Date(app.appliedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                {(mode === "tutor" || mode === "admin") && isPending && (
                  <>
                    <Button
                      size="sm"
                      disabled={busyId === app._id}
                      onClick={() => act(app, "accept")}
                    >
                      <Check className="size-4" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busyId === app._id}
                      onClick={() => act(app, "reject")}
                    >
                      <X className="size-4" /> Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
