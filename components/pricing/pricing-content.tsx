"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Check,
  GraduationCap,
  BookOpen,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"

import { CheckoutButton } from "@/components/payments/checkout-button"
import { Button } from "@/components/ui/button"
import type { Role } from "@/lib/types"

const plans = {
  student: [
    {
      name: "Free Student",
      price: "0",
      description: "Start finding the right tutor for your learning journey.",
      features: [
        "Browse all approved tuitions",
        "Apply for tuition",
        "Track application status",
        "Up to 5 saved tuitions",
        "Student dashboard access",
      ],
    },
    {
      name: "Pro Student",
      price: "10",
      description: "Get more flexibility and priority learning opportunities.",
      features: [
        "Everything in Free",
        "Unlimited tuition bookmarks",
        "Priority booking",
        "Pro member badge",
        "Premium learning experience",
      ],
    },
  ],
  tutor: [
    {
      name: "Free Tutor",
      price: "0",
      description: "Start sharing your knowledge with students.",
      features: [
        "Create up to 2 tuition posts",
        "Manage student applications",
        "Track applicant status",
        "Basic tutor dashboard",
        "Edit and manage tuition posts",
      ],
    },
    {
      name: "Pro Tutor",
      price: "15",
      description: "Grow your tutoring career with premium benefits.",
      features: [
        "Everything in Free",
        "Unlimited tuition posting",
        "Unlimited applicant management",
        "Verified tutor badge",
        "Premium tutor experience",
      ],
    },
  ],
}

/**
 * Pricing UI. `role` and `plan` come from the server-verified session in the
 * page component — never from the URL or client-side state.
 */
export function PricingContent({
  role,
  plan,
}: {
  role: Role | null
  plan: "free" | "pro"
}) {
  const [activeTab, setActiveTab] = useState<"student" | "tutor">("student")
  const isPro = plan === "pro"
  const isGuest = role === null

  const heading = (
    <section className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
        <Sparkles size={16} />
        Simple &amp; Transparent Pricing
      </span>

      <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
        Choose the Right Plan
        <span className="block text-red-600">For Your Journey.</span>
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-gray-500 sm:text-lg">
        Whether you are looking for the perfect tutor or growing your teaching
        career, MentorLagbe has the right plan for you.
      </p>
    </section>
  )

  const bottomNote = (
    <section className="mx-auto mt-16 max-w-2xl text-center">
      <h3 className="text-xl font-bold">Still have questions?</h3>
      <p className="mt-2 text-sm leading-6 text-gray-500">
        Choose a plan that fits your needs. You can upgrade to Pro whenever you
        are ready.
      </p>
    </section>
  )

  // Administrators do not purchase subscriptions.
  if (role === "admin") {
    return (
      <main className="min-h-screen bg-white px-4 py-16 text-gray-900 sm:px-6 lg:py-24">
        {heading}
        <section className="mx-auto mt-12 max-w-2xl">
          <div className="flex flex-col items-center rounded-2xl border border-gray-200 p-9 text-center shadow-sm">
            <div className="rounded-xl bg-gray-100 p-3 text-gray-700">
              <ShieldCheck size={26} />
            </div>
            <h2 className="mt-5 text-2xl font-bold">Administrator account</h2>
            <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
              Subscription plans are not available for administrator accounts.
              You already have full access to the platform.
            </p>
            <Link
              href="/dashboard/admin"
              className="mt-9 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-4 text-sm font-bold text-white transition-all hover:bg-red-700"
            >
              Go to admin dashboard
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>
    )
  }

  // Signed-in students/tutors see only their own role's Pro plan.
  // Guests keep the existing Student/Tutor toggle and see both plan sets.
  const visibleTab: "student" | "tutor" =
    role === "student" ? "student" : role === "tutor" ? "tutor" : activeTab
  const currentPlans = isGuest ? plans[visibleTab] : [plans[visibleTab][1]]

  return (
    <main className="min-h-screen bg-white px-4 py-16 text-gray-900 sm:px-6 lg:py-24">
      {heading}

      {/* Student / Tutor Toggle — visible to guests only */}
      {isGuest && (
        <div className="mx-auto mt-12 flex w-fit rounded-xl border border-gray-200 bg-gray-50 p-1.5">
          <button
            onClick={() => setActiveTab("student")}
            className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all sm:px-8 ${
              activeTab === "student"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-600 hover:text-red-600"
            }`}
          >
            <GraduationCap size={19} />
            Student
          </button>

          <button
            onClick={() => setActiveTab("tutor")}
            className={`flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition-all sm:px-8 ${
              activeTab === "tutor"
                ? "bg-red-600 text-white shadow-md"
                : "text-gray-600 hover:text-red-600"
            }`}
          >
            <BookOpen size={19} />
            Tutor
          </button>
        </div>
      )}

      <p className="mt-5 text-center text-sm text-gray-500">
        {isGuest ? (
          activeTab === "student" ? (
            "Plans designed for students and learners."
          ) : (
            "Plans designed for tutors and mentors."
          )
        ) : (
          <>
            You are on the{" "}
            <span className="font-semibold text-red-600">
              {isPro ? "Pro" : "Free"}
            </span>{" "}
            plan.{" "}
            {visibleTab === "student"
              ? "This is the Pro upgrade for students."
              : "This is the Pro upgrade for tutors."}
          </>
        )}
      </p>

      {/* Pricing Cards */}
      <section className="mx-auto mt-12 grid max-w-5xl gap-7 md:grid-cols-2">
        {currentPlans.map((pricingPlan) => {
          const isProCard = pricingPlan.name.startsWith("Pro")

          return (
            <div
              key={pricingPlan.name}
              className={`relative flex flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl sm:p-9 ${
                isProCard
                  ? "border-red-500 shadow-lg shadow-red-100"
                  : "border-gray-200 shadow-sm"
              }`}
            >
              {isProCard && (
                <span className="absolute -top-4 right-7 rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-lg">
                  MOST POPULAR
                </span>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{pricingPlan.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    {pricingPlan.description}
                  </p>
                </div>

                <div
                  className={`rounded-xl p-3 ${
                    isProCard
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {visibleTab === "student" ? (
                    <GraduationCap size={26} />
                  ) : (
                    <BookOpen size={26} />
                  )}
                </div>
              </div>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-extrabold tracking-tight">
                  ${pricingPlan.price}
                </span>
                <span className="mb-2 text-sm text-gray-500">/ month</span>
              </div>

              <div className="my-8 h-px bg-gray-100" />

              <h3 className="mb-5 font-bold">What&apos;s included:</h3>

              <ul className="flex-1 space-y-4">
                {pricingPlan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-gray-600"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>

              {isProCard ? (
                <div className="mt-9">
                  {isPro ? (
                    <Button disabled className="w-full">
                      Current plan
                    </Button>
                  ) : (
                    <CheckoutButton plan="pro" label="Get Pro Plan" />
                  )}
                </div>
              ) : (
                <Link
                  href={`/sign-up?role=${visibleTab}&plan=free`}
                  className="mt-9 flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-6 py-4 text-sm font-bold text-gray-900 transition-all hover:border-red-500 hover:text-red-600"
                >
                  Get Started Free
                  <ArrowRight size={17} />
                </Link>
              )}
            </div>
          )
        })}
      </section>

      {bottomNote}
    </main>
  )
}
