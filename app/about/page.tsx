import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  Target,
  Eye,
  Search,
  ClipboardCheck,
  ShieldCheck,
  Monitor,
  Star,
  CheckCircle2,
  HeartHandshake,
  Lightbulb,
  TrendingUp,
  Sparkles,
} from "lucide-react"

const features = [
  {
    icon: ShieldCheck,
    title: "Admin-Reviewed Listings",
    description:
      "Tuition posts are reviewed by administrators before appearing publicly on the platform.",
  },
  {
    icon: Search,
    title: "Smart Tuition Search",
    description:
      "Find suitable tuition opportunities with subject, class level, and mode filters.",
  },
  {
    icon: Monitor,
    title: "Online & Offline Learning",
    description:
      "Explore flexible learning opportunities that match your preferred learning environment.",
  },
  {
    icon: ClipboardCheck,
    title: "Easy Application Tracking",
    description:
      "Students can apply for tuition and track their application status from their dashboard.",
  },
  {
    icon: Users,
    title: "Dedicated Dashboards",
    description:
      "Students, tutors, and administrators get separate dashboards for managing their activities.",
  },
  {
    icon: TrendingUp,
    title: "Flexible Pro Membership",
    description:
      "Upgrade to Pro for additional benefits and more opportunities on MentorLagbe.",
  },
]

const steps = [
  {
    number: "01",
    icon: Users,
    title: "Create Your Account",
    description:
      "Join MentorLagbe as a student or tutor and create your personalized profile.",
  },
  {
    number: "02",
    icon: Search,
    title: "Explore Opportunities",
    description:
      "Students browse tuition listings while tutors discover opportunities to share their knowledge.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Apply & Connect",
    description:
      "Students submit applications and tutors manage incoming applications from their dashboard.",
  },
  {
    number: "04",
    icon: GraduationCap,
    title: "Start Learning",
    description:
      "Connect with the right people and begin a more personalized learning journey.",
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-20 sm:px-6 lg:pt-28 lg:pb-28">
        <div className="absolute top-10 -left-32 h-72 w-72 rounded-full bg-red-100/60 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-red-50 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
              <Sparkles size={16} />
              Get to Know MentorLagbe
            </span>

            <h1 className="mt-7 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Making Quality
              <span className="block text-red-600">Education Accessible</span>
              for Everyone.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-gray-500 sm:text-lg">
              MentorLagbe is a smart tuition and mentorship platform that
              connects students with qualified tutors. We make finding the right
              educational guidance easier, smarter, and more convenient.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/tuitions"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:-translate-y-1 hover:bg-red-700"
              >
                Explore Tuitions
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/sign-up?role=tutor"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-7 py-4 text-sm font-bold text-gray-800 transition hover:border-red-500 hover:text-red-600"
              >
                Become a Tutor
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-7 border-t border-gray-100 pt-7">
              <div>
                <h3 className="text-2xl font-extrabold text-red-600">02</h3>
                <p className="mt-1 text-sm text-gray-500">User Roles</p>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-red-600">02</h3>
                <p className="mt-1 text-sm text-gray-500">Learning Modes</p>
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-red-600">01</h3>
                <p className="mt-1 text-sm text-gray-500">Unified Platform</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[2rem] bg-red-100/60 blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-red-100 bg-gradient-to-br from-red-50 via-white to-red-100 p-5 shadow-2xl shadow-red-100/60 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600">
                    Welcome to
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold">MentorLagbe</h2>
                </div>
                <div className="rounded-2xl bg-red-600 p-3 text-white shadow-lg">
                  <GraduationCap size={30} />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="rounded-xl bg-red-50 p-3 text-red-600">
                    <GraduationCap size={25} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">For Students</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Find your ideal tutor
                    </p>
                  </div>
                  <CheckCircle2 className="text-red-500" size={20} />
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="rounded-xl bg-red-50 p-3 text-red-600">
                    <BookOpen size={25} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold">For Tutors</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Share your knowledge
                    </p>
                  </div>
                  <CheckCircle2 className="text-red-500" size={20} />
                </div>

                <div className="rounded-2xl bg-red-600 p-6 text-white">
                  <div className="flex items-center gap-2">
                    <HeartHandshake size={22} />
                    <span className="text-sm font-semibold">
                      Learn Together, Grow Together
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-red-100">
                    Building meaningful educational connections through
                    technology and mentorship.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:flex">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <Star size={22} />
              </div>
              <div>
                <p className="text-sm font-bold">Better Learning</p>
                <p className="text-xs text-gray-500">
                  Starts with the right tutor
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-bold tracking-widest text-red-600 uppercase">
              Our Purpose
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              What Drives <span className="text-red-600">Us Forward</span>
            </h2>
            <p className="mt-4 leading-7 text-gray-500">
              Our goal is to make educational connections simpler and create
              better learning opportunities for everyone.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl sm:p-10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Target size={30} />
              </div>
              <h3 className="text-2xl font-bold">Our Mission</h3>
              <p className="mt-4 leading-8 text-gray-500">
                Our mission is to simplify the process of finding qualified
                tutors and educational opportunities. We aim to help students
                receive personalized guidance while giving tutors a reliable
                platform to showcase their teaching skills.
              </p>
            </div>

            <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition hover:-translate-y-2 hover:shadow-xl sm:p-10">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <Eye size={30} />
              </div>
              <h3 className="text-2xl font-bold">Our Vision</h3>
              <p className="mt-4 leading-8 text-gray-500">
                Our vision is to build a trusted digital education community
                where students and tutors can connect effortlessly, share
                knowledge, and create meaningful learning experiences without
                unnecessary barriers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-20 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="text-sm font-bold tracking-widest text-red-600 uppercase">
              Simple Process
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              How MentorLagbe <span className="text-red-600">Works</span>
            </h2>
            <p className="mt-4 leading-7 text-gray-500">
              Getting started is simple. Follow four easy steps to connect,
              apply, and begin your learning journey.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon

              return (
                <div
                  key={step.number}
                  className="group relative rounded-3xl border border-gray-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-red-200 hover:shadow-xl hover:shadow-red-100/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
                      <Icon size={27} />
                    </div>
                    <span className="text-3xl font-extrabold text-red-100">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-7 text-lg font-bold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-500">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-gray-50 px-4 py-20 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-bold tracking-widest text-red-600 uppercase">
              Why MentorLagbe
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Everything You Need for
              <span className="block text-red-600">Better Learning</span>
            </h2>
            <p className="mt-4 leading-7 text-gray-500">
              Discover the features that make managing tuition and finding
              educational guidance easier.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-gray-100 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-red-100/40"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
                    <Icon size={24} />
                  </div>

                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-500">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Students & Tutors */}
      <section className="px-4 py-20 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-sm font-bold tracking-widest text-red-600 uppercase">
              Our Community
            </span>
            <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
              Made for <span className="text-red-600">Both Sides</span>
            </h2>
            <p className="mt-4 leading-7 text-gray-500">
              MentorLagbe brings students and tutors together in one connected
              educational ecosystem.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="rounded-3xl bg-white p-7 text-red-600 shadow-lg">
                  <GraduationCap size={65} strokeWidth={1.5} />
                </div>
              </div>
              <div className="p-8">
                <span className="text-xs font-bold tracking-widest text-red-600 uppercase">
                  For Students
                </span>
                <h3 className="mt-3 text-2xl font-extrabold">
                  Find Your Ideal Tutor
                </h3>
                <p className="mt-4 leading-7 text-gray-500">
                  Browse tuition listings, explore subjects, compare learning
                  opportunities, apply for tuition, and manage your applications
                  easily.
                </p>
                <Link
                  href="/tuitions"
                  className="mt-7 inline-flex items-center gap-2 font-bold text-red-600 transition hover:gap-4"
                >
                  Explore Tuitions <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-2 hover:shadow-xl">
              <div className="flex h-48 items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="rounded-3xl bg-white p-7 text-red-600 shadow-lg">
                  <BookOpen size={65} strokeWidth={1.5} />
                </div>
              </div>
              <div className="p-8">
                <span className="text-xs font-bold tracking-widest text-red-600 uppercase">
                  For Tutors
                </span>
                <h3 className="mt-3 text-2xl font-extrabold">
                  Share Your Knowledge
                </h3>
                <p className="mt-4 leading-7 text-gray-500">
                  Create tuition posts, showcase your expertise, receive student
                  applications, and manage your teaching activities from one
                  dashboard.
                </p>
                <Link
                  href="/sign-up?role=tutor"
                  className="mt-7 inline-flex items-center gap-2 font-bold text-red-600 transition hover:gap-4"
                >
                  Join as Tutor <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-red-600 px-7 py-16 text-center text-white shadow-2xl shadow-red-200 sm:px-12 lg:py-20">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
          <div className="absolute -right-10 -bottom-32 h-80 w-80 rounded-full border-[45px] border-white/10" />

          <div className="relative mx-auto max-w-3xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <Lightbulb size={34} />
            </div>

            <h2 className="mt-7 text-3xl leading-tight font-extrabold sm:text-4xl lg:text-5xl">
              Your Learning Journey
              <span className="block text-red-100">Starts Here.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-red-100 sm:text-base">
              Join MentorLagbe today. Find the right tutor, share your
              knowledge, and become part of a growing learning community.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-4">
              <Link
                href="/sign-up?role=student"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-red-600 transition hover:-translate-y-1 hover:bg-red-50"
              >
                Join as Student <ArrowRight size={18} />
              </Link>

              <Link
                href="/sign-up?role=tutor"
                className="inline-flex items-center gap-2 rounded-xl border border-white/50 px-7 py-4 text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-white/10"
              >
                Become a Tutor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
