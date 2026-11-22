import { Suspense } from "react"
import { TuitionsListing } from "@/components/tuitions/tuitions-listing"

export const metadata = {
  title: "Browse Tuitions",
  description:
    "Search and filter verified tuition opportunities across Bangladesh.",
}

/**
 * Server page wrapper. The listing itself is a client component that reads
 * search params, so it is wrapped in Suspense to satisfy Next 16's
 * requirement for useSearchParams at build time.
 */
export default function TuitionsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          Loading tuitions…
        </main>
      }
    >
      <TuitionsListing />
    </Suspense>
  )
}
