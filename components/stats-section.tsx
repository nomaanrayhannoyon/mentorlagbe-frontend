import { BookOpen, GraduationCap, Star, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Stat = {
  icon: LucideIcon
  value: string
  label: string
}

/** Static placeholder stats — replace with API data when available. */
const stats: Stat[] = [
  { icon: Users, value: "500+", label: "Verified Tutors" },
  { icon: GraduationCap, value: "12K+", label: "Happy Students" },
  { icon: BookOpen, value: "20K+", label: "Lessons Completed" },
  { icon: Star, value: "4.9", label: "Average Rating" },
]

export function StatsSection() {
  return (
    <section
      aria-label="Platform statistics"
      className="border-b bg-background"
    >
      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-6 lg:px-8">
        {stats.map(({ icon: Icon, value, label }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <span
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-burgundy-500/10 text-burgundy-600 dark:bg-burgundy-500/15 dark:text-burgundy-400"
            >
              <Icon className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              <p className="truncate text-sm text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
