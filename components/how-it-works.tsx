import { Award, Search, Send, UserPlus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"

type Step = {
  number: string
  icon: LucideIcon
  title: string
  description: string
}

/** Static placeholder steps — replace with API/CMS data when available. */
const steps: Step[] = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up as a Student to find mentors or as a Tutor to offer your academic expertise.",
  },
  {
    number: "02",
    icon: Search,
    title: "Browse & Discover",
    description:
      "Explore verified tuitions filtered by subject, class level, location, and learning mode.",
  },
  {
    number: "03",
    icon: Send,
    title: "Apply & Connect",
    description:
      "Submit applications with your preferred schedule and communicate directly with tutors.",
  },
  {
    number: "04",
    icon: Award,
    title: "Start Learning",
    description:
      "Begin your personalized tuition sessions and achieve your academic goals with confidence.",
  },
]

export function HowItWorks() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="bg-gradient-to-b from-burgundy-50/60 to-background dark:from-burgundy-950/30 dark:to-background"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Centered header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge
            variant="outline"
            className="border-burgundy-500/30 bg-burgundy-500/10 px-4 py-1.5 font-semibold tracking-wider text-burgundy-700 uppercase dark:text-burgundy-400"
          >
            How It Works
          </Badge>
          <h2
            id="how-it-works-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Start Learning in 4 Easy Steps
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground">
            From profile setup to your first live session, we make connecting
            with verified mentors seamless.
          </p>
        </div>

        {/* Horizontal stepper (stacked on mobile) */}
        <ol className="relative mt-12 grid gap-10 lg:grid-cols-4 lg:gap-0">
          <span
            aria-hidden
            className="absolute top-8 right-[12.5%] left-[12.5%] hidden border-t-2 border-dashed border-burgundy-500/30 lg:block"
          />
          {steps.map(({ number, icon: Icon, title, description }) => (
            <li
              key={number}
              className="group relative flex flex-col items-center gap-4 px-4 text-center"
            >
              <span className="relative z-10 flex size-16 items-center justify-center rounded-full border-2 border-burgundy-500/30 bg-background text-burgundy-600 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-burgundy-500 group-hover:bg-burgundy-600 group-hover:text-white dark:text-burgundy-400 dark:group-hover:text-white">
                <Icon aria-hidden className="size-6" />
                <span
                  aria-hidden
                  className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-burgundy-600 text-[10px] font-bold text-white ring-2 ring-background"
                >
                  {number}
                </span>
              </span>
              <h3 className="text-lg font-semibold transition-colors group-hover:text-burgundy-700 dark:group-hover:text-burgundy-400">
                {title}
              </h3>
              <p className="max-w-[30ch] text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
