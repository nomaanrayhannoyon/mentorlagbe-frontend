"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"

import { apiFetch, ApiError } from "@/lib/api-client"
import type { Tuition } from "@/lib/types"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Programming",
  "Accounting",
  "IELTS",
]

const LEVELS = ["Class 6-8", "Class 9", "Class 10", "SSC", "HSC", "University"]

const inputClass =
  "h-10 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type Props = {
  /** When set, the form is in edit mode and pre-fills fields. */
  tuition?: Tuition
}

export function TuitionForm({ tuition }: Props) {
  const router = useRouter()
  const isEdit = Boolean(tuition)
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(tuition?.title ?? "")
  const [description, setDescription] = useState(tuition?.description ?? "")
  const [subject, setSubject] = useState(tuition?.subject ?? "Mathematics")
  const [level, setLevel] = useState(tuition?.classLevel ?? "Class 9")
  const [mode, setMode] = useState<"Online" | "Offline">(
    tuition?.mode === "Online" ? "Online" : "Offline"
  )
  const [location, setLocation] = useState(tuition?.location ?? "")
  const [price, setPrice] = useState(String(tuition?.monthlyFee ?? ""))
  const [daysPerWeek, setDaysPerWeek] = useState(
    tuition?.daysPerWeek != null ? String(tuition.daysPerWeek) : ""
  )
  const [image, setImage] = useState<string | undefined>(tuition?.bannerImage)

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // If the user switches to offline, require a location.
  useEffect(() => {
    if (mode === "Offline") setLocation("")
  }, [mode])

  const handleImage = async (file: File) => {
    setUploading(true)
    setError("")
    try {
      const form = new FormData()
      form.append("image", file)
      const res = await apiFetch<{ url: string }>("/api/upload", {
        method: "POST",
        body: form,
      })
      setImage(res.url)
      toast.success("Image uploaded.")
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Image upload failed."
      setError(message)
      toast.error(message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!title || !description || !subject || !level || !price) {
      setError("Please fill in all required fields.")
      return
    }
    const priceNum = Number(price)
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a non-negative number.")
      return
    }
    if (mode === "Offline" && !location.trim()) {
      setError("Location is required for offline tuitions.")
      return
    }

    setSaving(true)
    try {
      const body = {
        title,
        description,
        subject,
        classLevel: level,
        mode,
        location: mode === "Offline" ? location : undefined,
        monthlyFee: priceNum,
        daysPerWeek: daysPerWeek ? Number(daysPerWeek) : undefined,
        bannerImage: image || undefined,
      }

      if (isEdit && tuition) {
        await apiFetch(`/api/tuitions/${tuition._id}`, {
          method: "PATCH",
          body,
        })
        toast.success("Tuition updated and sent for re-approval.")
      } else {
        await apiFetch("/api/tuitions", { method: "POST", body })
        toast.success(
          "Tuition posted. It will appear once approved by an admin."
        )
      }

      router.push("/dashboard/tuitions")
      router.refresh()
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Could not save tuition."
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mx-auto max-w-2xl p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Image upload */}
        <div>
          <Label className="mb-2">Cover image (optional)</Label>
          {image ? (
            <div className="relative overflow-hidden rounded-xl border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Tuition cover"
                className="aspect-[2/1] w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImage(undefined)}
                className="absolute top-2 right-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90"
                aria-label="Remove image"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-muted-foreground transition-colors hover:border-burgundy-500 hover:text-burgundy-600"
            >
              {uploading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                <Upload className="size-6" />
              )}
              <span className="text-sm">
                {uploading ? "Uploading…" : "Click to upload an image"}
              </span>
              <span className="text-xs">PNG, JPG, WEBP or GIF (max 5MB)</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleImage(file)
              e.target.value = ""
            }}
          />
        </div>

        <div>
          <Label htmlFor="title" className="mb-2">
            Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Experienced Math Tutor for HSC"
            required
            minLength={3}
            maxLength={120}
            className={inputClass}
          />
        </div>

        <div>
          <Label htmlFor="description" className="mb-2">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your teaching style, experience, and what students can expect…"
            required
            minLength={20}
            maxLength={2000}
            rows={5}
            className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <p className="mt-1 text-right text-xs text-muted-foreground">
            {description.length}/2000
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label className="mb-2">Subject</Label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={cn(inputClass, "w-full")}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="mb-2">Level</Label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={cn(inputClass, "w-full")}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label className="mb-2">Mode</Label>
          <div className="flex gap-2">
            {(["Online", "Offline"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                  mode === m
                    ? "border-burgundy-600 bg-burgundy-600 text-white"
                    : "border-input hover:bg-muted"
                )}
              >
                {m === "Online" ? "Online" : "Offline"}
              </button>
            ))}
          </div>
        </div>

        {mode === "Offline" && (
          <div>
            <Label htmlFor="location" className="mb-2">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Dhanmondi, Dhaka"
              required
              className={inputClass}
            />
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="price" className="mb-2">
              Price (BDT / month)
            </Label>
            <Input
              id="price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 3000"
              required
              className={inputClass}
            />
          </div>
          <div>
            <Label htmlFor="daysPerWeek" className="mb-2">
              Days per week (optional)
            </Label>
            <Input
              id="daysPerWeek"
              type="number"
              min={1}
              max={7}
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(e.target.value)}
              placeholder="e.g. 3"
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard/tuitions"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={saving || uploading}>
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Post tuition"
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}
