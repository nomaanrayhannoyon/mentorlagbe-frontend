import Image from "next/image"
import Link from "next/link"
import { ArrowRight, GraduationCap, Search, Sparkles } from "lucide-react"

import { cn } from "cn"
import { Button, buttonVariants } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-burgundy-50/70 via-background to-background dark:from-burgundy-950/40">
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-burgundy-200/40 blur-3xl dark:bg-burgundy-900/30"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -right-24 size-72 rounded-full bg-burgundy-100/70 blur-3xl dark:bg-burgundy-950/40"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-24">
        {/* Left column */}
        <div className="flex flex-col items-start gap-6 text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-burgundy-200 bg-burgundy-50 px-4 py-1.5 text-sm font-medium text-burgundy-700 dark:border-burgundy-800 dark:bg-burgundy-950/60 dark:text-burgundy-300">
            <Sparkles className="size-4" />
            Smart Learning, Brighter Future
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Find the Right Tutor.
            <br />
            <span className="text-burgundy-600 dark:text-burgundy-400">
              Build a Brighter Future.
            </span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Connect with verified tutors for personalized lessons online or in
            person. Search by subject, compare profiles, and book your first
            session in minutes.
          </p>

          {/* Search bar */}
          <form
            action="/tuitions"
            className="flex w-full max-w-xl items-center gap-2 rounded-full border bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-burgundy-500/40"
          >
            <label htmlFor="hero-search" className="sr-only">
              Search for a tutor
            </label>
            <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
            <input
              id="hero-search"
              name="q"
              type="text"
              placeholder="Search for subject (e.g. Math, Physics...)"
              className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground sm:text-base"
            />
            <Button type="submit" className="shrink-0 rounded-full px-5">
              Search
              <ArrowRight />
            </Button>
          </form>

          <Link
            href="/tuitions"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "rounded-full border-burgundy-200 px-6 text-burgundy-700 hover:bg-burgundy-50 hover:text-burgundy-800 dark:border-burgundy-800 dark:text-burgundy-300 dark:hover:bg-burgundy-950/60"
            )}
          >
            Browse Tuitions
            <ArrowRight />
          </Link>
        </div>

        {/* Right column */}
        <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
          {/* Burgundy blob behind the photo */}
          <div
            aria-hidden
            className="absolute -right-6 -bottom-6 h-full w-full rounded-[3rem] bg-burgundy-500/90 dark:bg-burgundy-600/80"
          />
          {/* Dot grid decoration */}
          <div
            aria-hidden
            className="absolute -top-5 -left-5 hidden h-24 w-32 [background-image:radial-gradient(theme(colors.burgundy.500)_1.5px,transparent_1.5px)] [background-size:14px_14px] opacity-70 sm:block"
          />
          {/* Floating graduation cap */}
          <div
            aria-hidden
            className="absolute -top-6 right-10 flex size-14 rotate-6 items-center justify-center rounded-2xl bg-white shadow-lg dark:bg-card"
          >
            <GraduationCap className="size-7 text-burgundy-600 dark:text-burgundy-400" />
          </div>

          <div className="relative overflow-hidden rounded-[2.5rem] border shadow-xl">
            <Image
              src="/images/hero-tutor.jpg"
              alt="A tutor guiding a student wearing glasses through a lesson on a laptop"
              width={1200}
              height={800}
              priority
              className="aspect-4/3 w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
