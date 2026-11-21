"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  BookOpen,
  ShieldCheck,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"

function SigninPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }

    setLoading(true)

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: "/",
      })

      if (error) {
        setError(error.message || "Invalid email or password.")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError("")

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      })
    } catch {
      setError("Google sign in failed. Please try again.")
    }
  }

  return (
    <main className="min-h-screen bg-[#FFF5F5] px-4 py-10 sm:px-6 lg:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Welcome Section */}
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E5484D] text-white">
              <BookOpen size={26} />
            </div>
            <span className="text-2xl font-extrabold text-gray-900">
              Mentor<span className="text-[#E5484D]">Lagbe</span>
            </span>
          </Link>

          <div className="mt-14">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-[#E5484D]">
              <ShieldCheck size={17} />
              Welcome Back to MentorLagbe
            </span>

            <h1 className="mt-6 text-5xl leading-tight font-extrabold text-gray-900">
              Your Learning Journey
              <span className="block text-[#E5484D]">Starts Here.</span>
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-8 text-gray-600">
              Sign in to connect with the right tutors, discover tuition
              opportunities, and continue achieving your learning goals.
            </p>

            <div className="mt-10 flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#E5484D] shadow-sm">
                <GraduationCap size={30} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Learn Without Limits
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Find opportunities and grow with MentorLagbe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sign In Form */}
        <section className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E5484D] text-white">
                <BookOpen size={24} />
              </div>
              <span className="text-2xl font-extrabold text-gray-900">
                Mentor<span className="text-[#E5484D]">Lagbe</span>
              </span>
            </Link>
          </div>

          <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-xl shadow-red-100/60 sm:p-9">
            <div className="mb-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#E5484D]">
                <Lock size={27} />
              </div>

              <h2 className="text-3xl font-extrabold text-gray-900">
                Welcome Back!
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Sign in to your MentorLagbe account.
              </p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
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

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#E5484D] transition hover:text-red-700"
                  >
                    Forgot Password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock
                    size={19}
                    className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pr-12 pl-11 text-sm text-gray-900 transition outline-none focus:border-[#E5484D] focus:bg-white focus:ring-4 focus:ring-red-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition hover:text-[#E5484D]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 accent-[#E5484D]"
                />
                <label
                  htmlFor="rememberMe"
                  className="cursor-pointer text-sm text-gray-600"
                >
                  Remember me
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#E5484D] py-3.5 font-bold text-white shadow-lg shadow-red-200 transition duration-300 hover:bg-red-600 hover:shadow-red-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}
                {!loading && <ArrowRight size={19} />}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-xs font-medium text-gray-400">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50"
            >
              <svg viewBox="0 0 48 48" className="h-5 w-5">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.97 46.98 31.8 46.98 24.55z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Sign Up Link */}
            <p className="mt-7 text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/sign-up"
                className="font-bold text-[#E5484D] transition hover:text-red-700"
              >
                Sign Up
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} MentorLagbe. All rights reserved.
          </p>
        </section>
      </div>
    </main>
  )
}

export default SigninPage
