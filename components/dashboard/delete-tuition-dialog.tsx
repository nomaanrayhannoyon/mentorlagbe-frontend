"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { apiFetch, ApiError } from "@/lib/api-client"
import type { Tuition } from "@/lib/types"

export function DeleteTuitionDialog({
  tuition,
  onClose,
  onDeleted,
}: {
  tuition: Tuition | null
  onClose: () => void
  onDeleted: () => void
}) {
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!tuition) return
    setDeleting(true)
    try {
      await apiFetch(`/api/tuitions/${tuition._id}`, { method: "DELETE" })
      onDeleted()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not delete tuition."
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={!!tuition} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete tuition?</DialogTitle>
          <DialogDescription>
            This will permanently delete <strong>{tuition?.title}</strong> and
            remove it from the listings. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
