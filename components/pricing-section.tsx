import { Check, BookOpen, Crown, Sparkles, ArrowRight } from "lucide-react"

const plans = [
  {
    name: "Free Plan",
    role: "For Everyone",
    price: "0",
    description: "Get started with the essential features of MentorLagbe.",
    icon: BookOpen,
    features: [
      "Up to 2 tuition posts (Tutor)",
      "Up to 5 tuition bookmarks (Student)",
      "Direct tuition applications",
      "Basic profile & search filters",
    ],
    button: "Get Started Free",
    link: "https://mentorlagbe-client.vercel.app/sign-up",
    popular: false,
  },
  {
    name: "PRO Membership",
    role: "For Students & Tutors",
    price: "10",
    description: "Unlock premium tools and grow faster with MentorLagbe.",
    icon: Crown,
    features: [
      "Unlimited tuition posts and bookmarks",
      "Golden PRO verification badge",
      "Priority listing in search & categories",
      "Priority tuition matching",
      "Priority applicant notifications",
      "Premium support",
    ],
    button: "Upgrade to PRO",
    link: "https://mentorlagbe-client.vercel.app/pricing",
    popular: true,
  },
]

export default function PricingSection() {
  return (
    <section className="relative isolate overflow-hidden bg-burgundy-950 px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute top-0 -left-40 -z-10 h-96 w-96 rounded-full bg-burgundy-500/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-burgundy-400/20 blur-[120px]" />

      <div className="mx-auto max-w-5xl">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-burgundy-400/30 bg-burgundy-400/10 px-5 py-2 text-sm font-semibold text-burgundy-300">
            <Sparkles size={16} />
            MENTORLAGBE MEMBERSHIP
          </span>

          <h2 className="mt-7 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Choose Your Plan
            <span className="mt-3 block bg-gradient-to-r from-burgundy-300 via-burgundy-300 to-burgundy-200 bg-clip-text text-transparent">
              Grow Beyond Limits.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-burgundy-100/70 sm:text-lg">
            Start for free or unlock premium features to take your learning and
            teaching journey further.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl items-stretch gap-8 md:grid-cols-2">
          {plans.map((plan) => {
            const Icon = plan.icon

            return (
              <div
                key={plan.name}
                className={`group relative flex flex-col overflow-hidden rounded-[28px] border p-7 shadow-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl sm:p-9 ${
                  plan.popular
                    ? "border-burgundy-300/80 bg-gradient-to-b from-burgundy-900 to-burgundy-950 ring-2 shadow-burgundy-950/40 ring-burgundy-400/20"
                    : "border-burgundy-800/70 bg-gradient-to-b from-burgundy-900/70 to-burgundy-950 shadow-black/20 hover:border-burgundy-400/60"
                }`}
              >
                <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-burgundy-400/10 blur-3xl transition-all group-hover:bg-burgundy-300/20" />

                {plan.popular && (
                  <div className="absolute top-6 right-6">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-burgundy-400 px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-burgundy-950 shadow-lg">
                      ★ POPULAR
                    </span>
                  </div>
                )}

                <div className="relative mb-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-burgundy-100 to-burgundy-200 text-burgundy-800 shadow-lg shadow-burgundy-950/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon size={27} strokeWidth={2} />
                  </div>

                  <span className="mt-5 inline-flex rounded-full border border-burgundy-300/20 bg-burgundy-300/10 px-3 py-1.5 text-xs font-semibold text-burgundy-200">
                    {plan.role}
                  </span>

                  <h3 className="mt-4 text-2xl font-extrabold text-white">
                    {plan.name}
                  </h3>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-burgundy-100/65">
                    {plan.description}
                  </p>
                </div>

                <div className="relative mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="bg-gradient-to-r from-burgundy-200 to-burgundy-300 bg-clip-text text-5xl font-black tracking-tight text-transparent">
                      ${plan.price}
                    </span>
                    <span className="text-sm font-medium text-burgundy-100/60">
                      / month
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-burgundy-100/70">
                    {plan.price === "0"
                      ? "Free forever. No hidden charges."
                      : "Flexible monthly subscription."}
                  </p>
                </div>

                <div className="mb-7 border-t border-burgundy-200/15" />

                <div className="relative mb-9 flex-1 space-y-5">
                  <h4 className="text-sm font-bold text-white">
                    What&apos;s included
                  </h4>

                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-burgundy-300/15 text-burgundy-300">
                        <Check size={13} strokeWidth={3} />
                      </span>

                      <span className="text-sm leading-6 text-burgundy-50/85">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <a
                  href={plan.link}
                  className="group/btn relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-burgundy-500 to-burgundy-500 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-burgundy-950/30 transition-all duration-300 hover:from-burgundy-400 hover:to-burgundy-400 hover:shadow-burgundy-500/20"
                >
                  {plan.button}
                  <ArrowRight
                    size={17}
                    className="transition-transform duration-300 group-hover/btn:translate-x-1"
                  />
                </a>
              </div>
            )
          })}
        </div>

        <div className="mt-14 text-center">
          <p className="text-sm text-burgundy-100/60">
            Learn. Teach. Grow with{" "}
            <span className="font-bold text-burgundy-300">MentorLagbe.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
