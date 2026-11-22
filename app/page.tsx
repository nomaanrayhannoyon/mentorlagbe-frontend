import { Hero } from "@/components/hero"
import { StatsSection } from "@/components/stats-section"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturedTuitions } from "@/components/featured-tuitions"
import { PricingSection } from "@/components/pricing-section"
import TopCategories from "@/components/top-categories"
import StudentFeedback from "@/components/student-feedback"
import { getCollection, Collections, type Tuition } from "@/lib/collections"
import type { Tuition as ClientTuition } from "@/lib/types"

/** Safely serialize a possibly-missing Date to an ISO string. */
function toIso(value: Date | undefined): string {
  return value ? new Date(value).toISOString() : new Date(0).toISOString()
}

/**
 * Server-rendered homepage. Fetches the latest approved tuitions from
 * MongoDB and passes them to the client card grid. Falls back to an empty
 * list (the grid then shows its "no tuitions yet" state) if the DB is
 * unreachable during build/prerender.
 */
export default async function Page() {
  let tuitions: ClientTuition[] = []

  try {
    const col = await getCollection<Tuition>(Collections.tuitions)
    const rows = await col
      .find({ approvalStatus: "approved" })
      .project({ tutorId: 0 })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray()

    tuitions = rows.map((r) => ({
      _id: r._id.toString(),
      title: r.title,
      description: r.description,
      subject: r.subject,
      classLevel: r.classLevel,
      mode: r.mode,
      location: r.location,
      monthlyFee: r.monthlyFee,
      daysPerWeek: r.daysPerWeek,
      bannerImage: r.bannerImage,
      tutorId: "",
      tutorName: r.tutorName,
      approvalStatus: r.approvalStatus,
      isActive: r.isActive,
      moderationNote: r.moderationNote,
      createdAt: toIso(r.createdAt),
      updatedAt: toIso(r.updatedAt),
    }))
  } catch (err) {
    // During `next build` the DB may not be reachable; the page still
    // renders with the empty state.
    console.warn("Homepage: could not load tuitions", err)
  }

  return (
    <>
      <Hero />
      <StatsSection />
      <HowItWorks />
      <FeaturedTuitions tuitions={tuitions} />
      <PricingSection />
      <TopCategories />
      <StudentFeedback />
    </>
  )
}
