import Link from "next/link"
import {
  Calculator,
  Atom,
  Code2,
  Languages,
  FlaskConical,
  ChartNoAxesCombined,
  GraduationCap,
  Users,
  BookCheck,
  ArrowUpRight,
} from "lucide-react"

const subjects = [
  { name: "Mathematics", count: "120+ Tuitions", icon: Calculator },
  { name: "Physics", count: "85+ Tuitions", icon: Atom },
  { name: "Programming", count: "95+ Tuitions", icon: Code2 },
  { name: "IELTS", count: "60+ Tuitions", icon: Languages },
  { name: "Chemistry", count: "70+ Tuitions", icon: FlaskConical },
  { name: "Accounting", count: "45+ Tuitions", icon: ChartNoAxesCombined },
]

const stats = [
  { value: "500+", label: "Active Tutors", icon: GraduationCap },
  { value: "2,000+", label: "Happy Students", icon: Users },
  { value: "1,000+", label: "Approved Tuitions", icon: BookCheck },
]

export default function TopCategories() {
  return (
    <section className="relative overflow-hidden bg-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-burgundy-500/30 bg-burgundy-500/10 px-4 py-1.5 text-sm font-semibold text-burgundy-700 dark:text-burgundy-400">
            Top Categories
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Popular{" "}
            <span className="text-burgundy-600 dark:text-burgundy-400">
              Subjects
            </span>
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">
            Browse vetted mentors across key academic fields, STEM tracks, and
            professional language programs.
          </p>
        </div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => {
            const Icon = subject.icon

            return (
              <Link
                key={subject.name}
                href={`/tuitions?subject=${subject.name}`}
                className="group rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-burgundy-500/40 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-burgundy-500/10 text-burgundy-600 transition-colors group-hover:bg-burgundy-600 group-hover:text-white dark:bg-burgundy-500/15 dark:text-burgundy-400">
                    <Icon size={25} />
                  </div>

                  <ArrowUpRight
                    size={21}
                    className="text-muted-foreground transition-all group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-burgundy-600 dark:group-hover:text-burgundy-400"
                  />
                </div>

                <h3 className="mt-6 text-xl font-bold">{subject.name}</h3>

                <p className="mt-2 text-sm font-medium text-burgundy-600 dark:text-burgundy-400">
                  {subject.count}
                </p>
              </Link>
            )
          })}
        </div>

        {/* Statistics */}
        <div className="mt-14 rounded-3xl border border-burgundy-800/60 bg-gradient-to-r from-burgundy-900 to-burgundy-950 p-7 shadow-xl sm:p-10">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-5">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-burgundy-400/15 text-burgundy-300">
                    <Icon size={25} />
                  </div>

                  <h3 className="text-3xl font-extrabold tracking-tight text-white">
                    {stat.value}
                  </h3>

                  <p className="mt-2 text-sm font-medium text-burgundy-100/70">
                    {stat.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
