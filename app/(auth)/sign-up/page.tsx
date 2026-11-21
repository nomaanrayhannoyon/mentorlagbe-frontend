"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  ArrowRight,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react"

export default function SignupPage() {
  const router = useRouter()

  const [role, setRole] = useState<"student" | "tutor">("student")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    try {
      setLoading(true)

      const result = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/",
        // Role persistence requires "role" to be configured
        // as an additional user field in Better Auth.
        role,
      } as Parameters<typeof authClient.signUp.email>[0])

      if (result.error) {
        setError(result.error.message || "Something went wrong.")
        return
      }

      router.push("/")
      router.refresh()
    } catch {
      setError("Unable to create your account. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError("")

    try {
      setGoogleLoading(true)

      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      })
    } catch {
      setError("Google sign up failed. Please try again.")
      setGoogleLoading(false)
    }
  }

  return (
    <main className="relative overflow-hidden bg-[#FFF7F7] px-4 py-12 sm:px-6 lg:py-16 dark:bg-[#131215]">
      {/* Background Decorations */}
      <div className="pointer-events-none absolute top-10 -left-32 h-80 w-80 rounded-full bg-red-200/40 blur-[100px] dark:bg-red-900/30" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-rose-200/50 blur-[110px] dark:bg-rose-900/30" />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Left Side - Welcome Section */}
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-lg shadow-red-200 dark:shadow-red-950/60">
              <GraduationCap size={27} />
            </div>

            <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Mentor
              <span className="text-red-600 dark:text-red-400">Lagbe</span>
            </span>
          </Link>

          <div className="mt-10 max-w-lg">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold tracking-wider text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
              <Sparkles size={15} />
              YOUR LEARNING JOURNEY STARTS HERE
            </span>

            <h1 className="mt-5 text-4xl leading-[1.15] font-extrabold tracking-tight text-gray-900 xl:text-5xl dark:text-white">
              Learn Better.
              <br />
              Teach Smarter.
              <br />
              <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent dark:from-red-400 dark:to-rose-400">
                Grow Together.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-gray-500 dark:text-gray-400">
              Join MentorLagbe and connect with passionate students and
              dedicated tutors. Build meaningful connections and unlock new
              opportunities.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-[#1c1a1d]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                  <GraduationCap size={21} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                    Students
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Find your mentor
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-[#1c1a1d]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                  <BookOpen size={21} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                    Tutors
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Share your knowledge
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-10 text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} MentorLagbe. All rights reserved.
          </p>
        </section>

        {/* Right Side - Signup Form */}
        <section className="mx-auto w-full max-w-md">
          <div className="overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-[0_25px_80px_-25px_rgba(220,38,38,0.18)] dark:border-white/10 dark:bg-[#1c1a1d] dark:shadow-[0_25px_80px_-25px_rgba(220,38,38,0.35)]">
            {/* Form Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-red-600 to-rose-600 px-7 py-8 text-white sm:px-9">
              <div className="pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full border-[30px] border-white/10" />
              <div className="pointer-events-none absolute right-20 -bottom-20 h-40 w-40 rounded-full bg-rose-300/20 blur-2xl" />

              <Link
                href="/"
                className="relative inline-flex items-center gap-2 lg:hidden"
              >
                <GraduationCap size={25} />
                <span className="text-xl font-extrabold">MentorLagbe</span>
              </Link>

              <div className="relative mt-3 lg:mt-0">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm">
                  <Sparkles size={23} />
                </div>

                <h2 className="text-3xl font-extrabold tracking-tight">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-red-100">
                  Join our learning community and start your journey today.
                </p>
              </div>
            </div>

            {/* Form Body */}
            <form
              onSubmit={handleSignup}
              className="space-y-5 px-7 py-8 sm:px-9"
            >
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Full Name
                </label>

                <div className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition-all focus-within:border-red-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-red-500 dark:focus-within:bg-[#1c1a1d] dark:focus-within:ring-red-950/40">
                  <User
                    size={19}
                    className="shrink-0 text-gray-400 transition-colors group-focus-within:text-red-500 dark:text-gray-500 dark:group-focus-within:text-red-400"
                  />

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="h-12 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Email Address
                </label>

                <div className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition-all focus-within:border-red-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-red-500 dark:focus-within:bg-[#1c1a1d] dark:focus-within:ring-red-950/40">
                  <Mail
                    size={19}
                    className="shrink-0 text-gray-400 transition-colors group-focus-within:text-red-500 dark:text-gray-500 dark:group-focus-within:text-red-400"
                  />

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-12 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Password
                </label>

                <div className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 transition-all focus-within:border-red-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-red-50 dark:border-white/10 dark:bg-white/5 dark:focus-within:border-red-500 dark:focus-within:bg-[#1c1a1d] dark:focus-within:ring-red-950/40">
                  <Lock
                    size={19}
                    className="shrink-0 text-gray-400 transition-colors group-focus-within:text-red-500 dark:text-gray-500 dark:group-focus-within:text-red-400"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="h-12 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="shrink-0 text-gray-400 transition-colors hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    I want to join as
                  </label>
                  <span className="text-xs text-red-500 dark:text-red-400">
                    Choose one
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {[
                    { value: "student", label: "Student", icon: GraduationCap },
                    { value: "tutor", label: "Tutor", icon: BookOpen },
                  ].map((item) => {
                    const Icon = item.icon
                    const selected = role === item.value

                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setRole(item.value as "student" | "tutor")
                        }
                        aria-pressed={selected}
                        className={`group flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${
                          selected
                            ? "border-red-500 bg-red-50 shadow-[0_0_18px_rgba(220,38,38,0.12)] dark:bg-red-950/40"
                            : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-red-800 dark:hover:bg-red-950/30"
                        }`}
                      >
                        <span
                          className={`flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                            selected
                              ? "border-red-600 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.45)]"
                              : "border-gray-300 group-hover:border-red-400 dark:border-gray-600"
                          }`}
                        >
                          {selected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </span>

                        <Icon
                          size={19}
                          className={`transition-colors ${
                            selected
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-400 group-hover:text-red-500 dark:text-gray-500 dark:group-hover:text-red-400"
                          }`}
                        />

                        <span
                          className={`text-sm font-bold ${
                            selected
                              ? "text-red-700 dark:text-red-300"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {item.label}
                        </span>

                        {selected && (
                          <Check
                            size={16}
                            className="ml-auto text-red-600 dark:text-red-400"
                          />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Create Account */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="group flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all duration-300 hover:-translate-y-0.5 hover:from-red-700 hover:to-rose-700 hover:shadow-xl hover:shadow-red-200 disabled:cursor-not-allowed disabled:opacity-60 dark:shadow-red-950/50"
              >
                {loading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight
                      size={18}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
                  OR CONTINUE WITH
                </span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
              </div>

              {/* Google Signup */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading || googleLoading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition-all duration-300 hover:border-red-200 hover:bg-red-50/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-gray-200 dark:hover:border-red-900/60 dark:hover:bg-red-950/30"
              >
                {googleLoading ? (
                  <>
                    <Loader2 size={19} className="animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 48 48"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                        transform="translate(0 4)"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.72 7.18l7.62 5.91c4.45-4.11 7.14-10.16 7.14-17.56Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.9 23.9 0 0 0 0 21.56l7.98-6.19Z"
                        transform="translate(0 4)"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.9-5.89l-7.62-5.91c-2.12 1.42-4.84 2.3-8.28 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
                      />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              {/* Sign In */}
              <p className="pt-1 text-center text-sm text-gray-500 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-bold text-red-600 transition-colors hover:text-red-700 hover:underline dark:text-red-400 dark:hover:text-red-300"
                >
                  Sign In
                </Link>
              </p>
            </form>
          </div>

          <p className="mt-5 text-center text-xs text-gray-400 lg:hidden dark:text-gray-500">
            © {new Date().getFullYear()} MentorLagbe. All rights reserved.
          </p>
        </section>
      </div>
    </main>
  )
}
