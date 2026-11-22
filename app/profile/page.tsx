"use client"

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import Link from "next/link"
import {
  Camera,
  Crown,
  FileText,
  Loader2,
  Mail,
  Phone,
  Save,
  User,
  UserCog,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { apiFetch, ApiError } from "@/lib/api-client"
import { toast } from "sonner"
import { authClient, type AuthUser } from "@/lib/auth-client"
import { cn } from "cn"

const inputClass =
  "h-12 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"

const wellClass =
  "group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition-all focus-within:border-red-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-red-500 dark:focus-within:bg-[#1c1a1d] dark:focus-within:ring-red-950/40"

const iconClass =
  "shrink-0 text-gray-400 transition-colors group-focus-within:text-red-500 dark:text-gray-500 dark:group-focus-within:text-red-400"

const labelClass =
  "mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"

function Field({
  id,
  label,
  icon: Icon,
  children,
}: {
  id: string
  label: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className={wellClass}>
        <Icon size={19} className={iconClass} />
        {children}
      </div>
    </div>
  )
}

function Decorations() {
  return (
    <>
      <div className="pointer-events-none absolute top-10 -left-32 h-80 w-80 rounded-full bg-red-200/40 blur-[100px] dark:bg-red-900/30" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-rose-200/50 blur-[110px] dark:bg-rose-900/30" />
    </>
  )
}

export default function UpdateProfilePage() {
  const { data, isPending, refetch } = authClient.useSession()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const populatedRef = useRef(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const avatarUrl = (data?.user as AuthUser | undefined)?.image ?? ""
  const plan = (data?.user as AuthUser | undefined)?.plan ?? "free"

  const handleAvatarChange = async (file: File | undefined) => {
    if (!file) return
    if (!/^image\//.test(file.type)) {
      toast.error("Please choose an image file.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.")
      return
    }
    setUploading(true)
    try {
      const form = new FormData()
      form.append("image", file)
      const res = await apiFetch<{ url: string }>("/api/upload", {
        method: "POST",
        body: form,
      })
      const result = await authClient.updateUser({
        image: res.url,
      } as Parameters<typeof authClient.updateUser>[0])
      if (result.error) {
        toast.error(result.error.message || "Could not save profile photo.")
        return
      }
      toast.success("Profile photo updated.")
      void refetch()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Image upload failed."
      )
    } finally {
      setUploading(false)
    }
  }

  // Fill the form from the session once it arrives. The ref keeps later
  // session refreshes from wiping in-progress edits.
  useEffect(() => {
    if (!data) {
      populatedRef.current = false
      return
    }
    if (populatedRef.current) return
    const user = data.user as AuthUser
    setName(user.name ?? "")
    setEmail(user.email ?? "")
    setPhone(user.phone ?? "")
    setBio(user.bio ?? "")
    populatedRef.current = true
  }, [data])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      setError("Please enter your name.")
      return
    }

    setSaving(true)

    try {
      // name / phone / bio are additional fields handled by /update-user.
      // The client's generated types only know name/image, hence the cast
      // (same pattern as the Sign Up page).
      const result = await authClient.updateUser({
        name: trimmedName,
        phone: phone.trim(),
        bio: bio.trim(),
      } as Parameters<typeof authClient.updateUser>[0])

      if (result.error) {
        setError(result.error.message || "Could not save your changes.")
        return
      }

      // Email changes go through the dedicated /change-email endpoint.
      const currentEmail = (data?.user as AuthUser | undefined)?.email ?? ""
      const nextEmail = email.trim().toLowerCase()

      if (nextEmail && nextEmail !== currentEmail.toLowerCase()) {
        const emailResult = await authClient.changeEmail({
          newEmail: nextEmail,
        })

        if (emailResult.error) {
          setError(
            emailResult.error.message ||
              "Your profile was saved, but the email could not be updated."
          )
          return
        }
      }

      setSuccess("Your changes have been saved.")
      void refetch()
    } catch {
      setError("Unable to save your changes. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (isPending) {
    return (
      <main className="relative overflow-hidden bg-[#FFF7F7] px-4 py-16 sm:px-6 dark:bg-[#131215]">
        <Decorations />
        <div
          aria-hidden
          className="relative mx-auto max-w-lg animate-pulse rounded-[28px] border border-red-100 bg-white p-8 dark:border-white/10 dark:bg-[#1c1a1d]"
        >
          <div className="h-8 w-44 rounded-lg bg-muted" />
          <div className="mt-7 space-y-5">
            <div className="h-12 rounded-xl bg-muted" />
            <div className="h-12 rounded-xl bg-muted" />
            <div className="h-12 rounded-xl bg-muted" />
            <div className="h-28 rounded-xl bg-muted" />
          </div>
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="relative overflow-hidden bg-[#FFF7F7] px-4 py-16 sm:px-6 dark:bg-[#131215]">
        <Decorations />
        <div className="relative mx-auto max-w-md rounded-[28px] border border-red-100 bg-white px-7 py-10 text-center shadow-[0_25px_80px_-25px_rgba(220,38,38,0.18)] dark:border-white/10 dark:bg-[#1c1a1d]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-lg shadow-red-200 dark:shadow-red-950/60">
            <UserCog size={24} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Update Profile
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Please sign in to manage your account details.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/sign-up" className={cn(buttonVariants({}))}>
              Sign Up
            </Link>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Back Home
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="relative overflow-hidden bg-[#FFF7F7] px-4 py-12 sm:px-6 lg:py-16 dark:bg-[#131215]">
      <Decorations />

      <div className="relative mx-auto w-full max-w-lg">
        <div className="overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-[0_25px_80px_-25px_rgba(220,38,38,0.18)] dark:border-white/10 dark:bg-[#1c1a1d] dark:shadow-[0_25px_80px_-25px_rgba(220,38,38,0.35)]">
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-600 to-rose-600 px-7 py-7 text-white sm:px-9">
            <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full border-[30px] border-white/10" />
            <div className="relative flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm">
                <UserCog size={22} />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Update Profile
                </h1>
                <p className="mt-0.5 text-sm text-red-100">
                  Keep your account details up to date.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 px-7 py-8 sm:px-9">
            {/* Profile photo + plan badge */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading}
                className="group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 text-gray-400 transition hover:border-red-400 dark:border-white/10 dark:bg-white/5"
                aria-label="Upload profile photo"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="size-full object-cover"
                  />
                ) : (
                  <User size={28} />
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100">
                  {uploading ? (
                    <Loader2 className="size-5 animate-spin" />
                  ) : (
                    <Camera className="size-5" />
                  )}
                </span>
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleAvatarChange(e.target.files?.[0])
                  e.target.value = ""
                }}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Profile photo
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  JPG, PNG or GIF. Max 5MB.
                </p>
                <span
                  className={cn(
                    "mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    plan === "pro"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                      : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                  )}
                >
                  {plan === "pro" && <Crown className="size-3" />}
                  {plan === "pro" ? "Pro plan" : "Free plan"}
                </span>
              </div>
            </div>

            <Field id="profile-name" label="Full Name" icon={User}>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your full name"
                className={inputClass}
              />
            </Field>

            <Field id="profile-email" label="Email Address" icon={Mail}>
              <input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </Field>

            <Field id="profile-phone" label="Phone Number" icon={Phone}>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="+880 1XXXXXXXXX"
                className={inputClass}
              />
            </Field>

            {/* Bio */}
            <div>
              <label htmlFor="profile-bio" className={labelClass}>
                Bio
              </label>
              <div className={cn(wellClass, "items-start py-3")}>
                <FileText size={19} className={cn(iconClass, "mt-3")} />
                <textarea
                  id="profile-bio"
                  rows={4}
                  maxLength={500}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell others a little about yourself"
                  className="min-h-24 w-full resize-none bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                />
              </div>
              <p className="mt-1.5 text-right text-xs text-gray-400 dark:text-gray-500">
                {bio.length}/500
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/60 dark:bg-green-950/40 dark:text-green-400"
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all duration-300 hover:-translate-y-0.5 hover:from-red-700 hover:to-rose-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-red-950/50"
            >
              {saving ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-gray-400 dark:text-gray-500">
          <Link
            href="/"
            className="transition-colors hover:text-red-600 dark:hover:text-red-400"
          >
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  )
}
