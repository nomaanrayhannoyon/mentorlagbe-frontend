"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react"
import Link from "next/link"

import { apiFetch, ApiError } from "@/lib/api-client"
import type { TuitionListResponse, Tuition } from "@/lib/types"
import { TuitionCard } from "@/components/tuition-card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Programming",
  "Accounting",
  "IELTS",
]

const LEVELS = ["Class 6-8", "Class 9", "Class 10", "SSC", "HSC", "University"]

export function TuitionsListing() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Filter state mirrored in URL search params
  const [q, setQ] = useState(searchParams.get("q") ?? "")
  const [subject, setSubject] = useState(searchParams.get("subject") ?? "")
  const [mode, setMode] = useState(searchParams.get("mode") ?? "")
  const [level, setLevel] = useState(searchParams.get("level") ?? "")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "")
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest")
  const [page, setPage] = useState(Number(searchParams.get("page") ?? "1"))

  const [data, setData] = useState<TuitionListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  const buildQuery = useCallback(
    (overrides?: Partial<Record<string, string | number>>) => {
      const params = new URLSearchParams()
      const merged = {
        q,
        subject,
        mode,
        level,
        minPrice,
        maxPrice,
        sort,
        page,
        ...overrides,
      }
      for (const [k, v] of Object.entries(merged)) {
        if (v !== undefined && v !== null && v !== "" && v !== "0") {
          params.set(k, String(v))
        }
      }
      return params
    },
    [q, subject, mode, level, minPrice, maxPrice, sort, page]
  )

  // Sync URL when filters change
  useEffect(() => {
    const params = buildQuery()
    router.replace(`/tuitions?${params.toString()}`, { scroll: false })
  }, [buildQuery, router])

  // Fetch whenever the query changes
  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (subject) params.set("subject", subject)
    if (mode) params.set("mode", mode)
    if (level) params.set("level", level)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    if (sort) params.set("sort", sort)
    params.set("page", String(page))
    params.set("limit", "12")

    apiFetch<TuitionListResponse>(`/api/tuitions?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => setData(res))
      .catch((err) => {
        if (err instanceof ApiError && err.name === "AbortError") return
        if (err instanceof Error && err.name === "AbortError") return
        toast.error("Could not load tuitions.")
        setData(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [q, subject, mode, level, minPrice, maxPrice, sort, page])

  const clearFilters = () => {
    setQ("")
    setSubject("")
    setMode("")
    setLevel("")
    setMinPrice("")
    setMaxPrice("")
    setSort("newest")
    setPage(1)
  }

  const activeFilterCount = [subject, mode, level, minPrice, maxPrice].filter(
    Boolean
  ).length

  const totalPages = data?.totalPages ?? 1

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Browse Tuitions
            </h1>
            <p className="mt-2 text-muted-foreground">
              Discover verified tutors and tuition opportunities across
              Bangladesh.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setShowFilters((s) => !s)}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <Link
              href="/dashboard/tuitions/new"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Post a Tuition
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-8 flex items-center gap-2 rounded-full border bg-card p-2 shadow-sm focus-within:ring-2 focus-within:ring-burgundy-500/40">
          <Search className="ml-3 size-5 shrink-0 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(1)
            }}
            placeholder="Search by title, subject or keyword…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear search"
              className="mr-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Sidebar filters */}
          <aside
            className={cn(
              "w-full shrink-0 space-y-6 lg:w-64",
              !showFilters && "hidden lg:block"
            )}
          >
            <div className="rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Filters</h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-medium text-burgundy-600 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="mb-2">Subject</Label>
                  <select
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value)
                      setPage(1)
                    }}
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">All subjects</option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="mb-2">Mode</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "", label: "Any" },
                      { value: "online", label: "Online" },
                      { value: "in-person", label: "In person" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setMode(opt.value)
                          setPage(1)
                        }}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          mode === opt.value
                            ? "border-burgundy-600 bg-burgundy-600 text-white"
                            : "border-input hover:bg-muted"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Level</Label>
                  <select
                    value={level}
                    onChange={(e) => {
                      setLevel(e.target.value)
                      setPage(1)
                    }}
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="">All levels</option>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="mb-2">Price range (BDT)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={minPrice}
                      onChange={(e) => {
                        setMinPrice(e.target.value)
                        setPage(1)
                      }}
                      placeholder="Min"
                      className="h-9"
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="number"
                      min={0}
                      value={maxPrice}
                      onChange={(e) => {
                        setMaxPrice(e.target.value)
                        setPage(1)
                      }}
                      placeholder="Max"
                      className="h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Sort by</Label>
                  <select
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value)
                      setPage(1)
                    }}
                    className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <section className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {loading
                  ? "Searching…"
                  : `${data?.total ?? 0} tuition${
                      data?.total === 1 ? "" : "s"
                    } found`}
              </span>
              {(q || subject || mode || level || minPrice || maxPrice) && (
                <button
                  onClick={clearFilters}
                  className="font-medium text-burgundy-600 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-72 animate-pulse rounded-2xl bg-muted"
                  />
                ))}
              </div>
            ) : !data || data.items.length === 0 ? (
              <div className="rounded-2xl border border-dashed p-12 text-center">
                <Search className="mx-auto size-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">
                  No tuitions found
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try adjusting your search or filters.
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-5"
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {data.items.map((tuition: Tuition) => (
                    <TuitionCard key={tuition._id} tuition={tuition} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="px-3 text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
