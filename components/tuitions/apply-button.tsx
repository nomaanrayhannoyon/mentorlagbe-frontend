"use client"

import { useEffect, useState } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

import { apiFetch, ApiError } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ApplyButton({ tuitionId }: { tuitionId: string }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [phone, setPhone] = useState("")
  const [schedule, setSchedule] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [applied, setApplied] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check if the user already applied.
  useEffect(() => {
    let cancelled = false
    apiFetch<{ items: Array<{ tuitionId: string }> }>("/api/applications")
      .then((res) => {
        if (!cancelled) {
          setApplied(res.items.some((a) => a.tuitionId === tuitionId))
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecking(false)
      })
    return () => {
      cancelled = true
    }
  }, [tuitionId])

  const submit = async () => {
    setSubmitting(true)
    try {
      await apiFetch("/api/applications", {
        method: "POST",
        body: {
          tuitionId,
          studentPhone: phone,
          preferredSchedule: schedule,
          studentNote: message,
        },
      })
      setApplied(true)
      setOpen(false)
      toast.success("Application submitted. Track it in your dashboard.")
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not submit application."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (checking) {
    return (
      <Button className="w-full" disabled>
        <Loader2 className="size-4 animate-spin" /> Checking…
      </Button>
    )
  }

  if (applied) {
    return (
      <Button className="w-full" variant="secondary" disabled>
        <CheckCircle2 className="size-4" /> Applied
      </Button>
    )
  }

  return (
    <>
      <Button className="w-full" onClick={() => setOpen(true)}>
        Apply for this tuition
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for this tuition</DialogTitle>
            <DialogDescription>
              Introduce yourself to the tutor. A short message helps them
              understand your goals.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="apply-phone">Phone number</Label>
            <Textarea
              id="apply-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 01712345678"
              rows={1}
              maxLength={30}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
            <Label htmlFor="apply-schedule">Preferred schedule</Label>
            <Textarea
              id="apply-schedule"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              placeholder="e.g. Weekday evenings"
              rows={1}
              maxLength={160}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
            <Label htmlFor="apply-message">Message (optional)</Label>
            <Textarea
              id="apply-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm interested in your tuition because…"
              rows={4}
              maxLength={2000}
              className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
            />
            <p className="text-right text-xs text-muted-foreground">
              {message.length}/2000
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting || !phone.trim() || !schedule.trim()}
            >
              Cancel
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Submit application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
