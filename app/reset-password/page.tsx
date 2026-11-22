"use client"

import { Suspense, useState, type FormEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Lock, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react"

import { authClient } from "@/lib/auth-client"

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center text-muted-foreground">
          Loading…
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!token) {
      setError("Invalid reset link. Please request a new one.")
      return
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      })
      if (error) {
        setError(error.message || "Could not reset password.")
        return
      }
      setDone(true)
      setTimeout(() => router.push("/sign-in"), 2000)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF5F5] px-4 py-12 dark:bg-[#131215]">
      <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 shadow-xl shadow-red-100/60 sm:p-10 dark:border-white/10 dark:bg-[#1c1a1d]">
        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <CheckCircle2 size={28} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Password reset
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              Your password has been updated. Redirecting to sign in…
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#E5484D]">
              <Lock size={27} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Set a new password
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Choose a strong password you have not used before.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  New password
                </label>
                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-12 pl-11 text-sm text-gray-900 transition outline-none focus:border-[#E5484D] focus:bg-white focus:ring-4 focus:ring-red-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-[#E5484D]"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Confirm password
                </label>
                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="confirm"
                    type={show ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-4 pl-11 text-sm text-gray-900 transition outline-none focus:border-[#E5484D] focus:bg-white focus:ring-4 focus:ring-red-100"
                  />
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5484D] py-3.5 font-bold text-white shadow-lg shadow-red-200 transition duration-300 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" /> Saving…
                  </>
                ) : (
                  "Reset password"
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                Remembered it?{" "}
                <Link
                  href="/sign-in"
                  className="font-bold text-[#E5484D] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
