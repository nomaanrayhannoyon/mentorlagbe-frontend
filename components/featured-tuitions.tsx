import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { TuitionCard } from "@/components/tuition-card"
import { Badge } from "@/components/ui/badge"
import type { Tuition } from "@/lib/tuitions"

type FeaturedTuitionsProps = {
  tuitions: Tuition[]
}

export function FeaturedTuitions({ tuitions }: FeaturedTuitionsProps) {
  return (
    <section aria-labelledby="featured-tuitions-heading" className="bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col items-start gap-4">
            <Badge
              variant="outline"
              className="border-burgundy-500/30 bg-burgundy-500/10 px-4 py-1.5 font-semibold tracking-wider text-burgundy-700 uppercase dark:text-burgundy-400"
            >
              Featured Tuitions
            </Badge>
            <h2
              id="featured-tuitions-heading"
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Latest Approved Tuitions
            </h2>
            <p className="max-w-xl text-base text-muted-foreground">
              Discover top-rated home and online tuition opportunities verified
              by academic administrators.
            </p>
          </div>

          <Link
            href="/tutors"
            className="group/link inline-flex items-center gap-2 text-sm font-semibold text-burgundy-600 transition-colors hover:text-burgundy-700 dark:text-burgundy-400 dark:hover:text-burgundy-300"
          >
            Browse All Tuitions
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover/link:translate-x-1"
            />
          </Link>
        </div>

        {tuitions.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
            No approved tuitions yet — check back soon.
          </p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tuitions.map((tuition) => (
              <TuitionCard key={tuition.id} tuition={tuition} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
