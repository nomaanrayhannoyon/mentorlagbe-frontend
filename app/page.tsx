import { Hero } from "@/components/hero"
import { StatsSection } from "@/components/stats-section"
import { HowItWorks } from "@/components/how-it-works"
import { FeaturedTuitions } from "@/components/featured-tuitions"
import { featuredTuitions } from "@/lib/tuitions"
import PricingSection from "@/components/pricing-section"
import TopCategories from "@/components/top-categories"
import StudentFeedback from "@/components/student-feedback"

export default function Page() {
  return (
    <>
      <Hero />
      <StatsSection />
      <HowItWorks />
      <FeaturedTuitions tuitions={featuredTuitions} />
      <PricingSection />
      <TopCategories />
      <StudentFeedback />
    </>
  )
}
