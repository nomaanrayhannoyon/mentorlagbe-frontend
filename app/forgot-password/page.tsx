"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"

import { authClient } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      })
      if (error) {
        setError(error.message || "Could not send reset email.")
        return
      }
      setSent(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFF5F5] px-4 py-12 dark:bg-[#131215]">
      <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 shadow-xl shadow-red-100/60 sm:p-10 dark:border-white/10 dark:bg-[#1c1a1d]">
        <Link
          href="/sign-in"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>

        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600">
              <CheckCircle2 size={28} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
              Check your email
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              We have sent a password reset link to <strong>{email}</strong>.
              Click the link to choose a new password.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#E5484D]">
              <Mail size={27} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Forgot password?
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Enter your email and we will send you a link to reset it.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
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
                    <Loader2 className="size-5 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}
