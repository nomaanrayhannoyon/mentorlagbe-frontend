import Link from "next/link"
import {
  Star,
  Quote,
  ArrowRight,
  BadgeCheck,
  GraduationCap,
  BookOpen,
} from "lucide-react"

const testimonials = [
  {
    name: "Arif Hossain",
    role: "University Student",
    initials: "AH",
    quote:
      "Finding the right mentor used to be difficult. MentorLagbe made the whole experience simple, convenient, and reliable.",
  },
  {
    name: "Maliha Rahman",
    role: "English Language Learner",
    initials: "MR",
    quote:
      "The platform helped me connect with an experienced tutor who understands my learning goals. My confidence has grown so much!",
  },
  {
    name: "Samiul Karim",
    role: "Professional Tutor",
    initials: "SK",
    quote:
      "I can connect with motivated students and manage my tuition requests easily. It is a great platform for growing as a mentor.",
  },
]

export default function StudentFeedback() {
  return (
    <section className="relative overflow-hidden bg-burgundy-950 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-burgundy-400/30 bg-burgundy-400/10 px-4 py-1.5 text-sm font-semibold text-burgundy-300">
            Community Stories
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            What Our Community
            <span className="block text-burgundy-400">Says About Us</span>
          </h2>

          <p className="mt-5 text-sm leading-7 text-burgundy-100/70 sm:text-base">
            Discover how MentorLagbe is making quality learning and teaching
            more accessible for everyone.
          </p>
        </div>

        {/* Three Feedback Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <div
              key={item.name}
              className="group flex flex-col rounded-2xl border border-burgundy-800/70 bg-gradient-to-br from-burgundy-900 to-burgundy-950 p-6 transition-all duration-300 hover:-translate-y-2 hover:border-burgundy-400/50 hover:shadow-xl hover:shadow-burgundy-950/40 sm:p-7"
            >
              {/* Quote & Rating */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-burgundy-400/15 text-burgundy-300">
                  <Quote size={23} />
                </div>

                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
              </div>

              {/* Review */}
              <p className="flex-1 text-[15px] leading-8 text-burgundy-50/90">
                “{item.quote}”
              </p>

              {/* User Profile */}
              <div className="mt-7 border-t border-burgundy-700/60 pt-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-burgundy-400/20 text-sm font-bold text-burgundy-300 ring-2 ring-burgundy-400/20">
                    {item.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="font-bold text-white">{item.name}</h3>

                      <BadgeCheck size={17} className="text-burgundy-400" />
                    </div>

                    <p className="mt-1 text-xs leading-5 text-burgundy-200/70">
                      {item.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Join MentorLagbe Section */}
        <div className="relative mt-16 overflow-hidden rounded-3xl border border-burgundy-700/60 bg-gradient-to-br from-burgundy-900 via-burgundy-800 to-burgundy-950 px-6 py-12 shadow-xl shadow-black/10 sm:px-10">
          {/* CTA Heading */}
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="text-sm font-semibold tracking-wider text-burgundy-300 uppercase">
              Join MentorLagbe
            </span>

            <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              Your Journey Starts Here
            </h3>

            <p className="mt-4 text-sm leading-7 text-burgundy-100/70 sm:text-base">
              Choose how you want to grow with MentorLagbe. Find opportunities,
              build connections, and achieve more.
            </p>
          </div>

          {/* Student & Tutor Cards */}
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Student Card */}
            <div className="group rounded-2xl border border-burgundy-700/60 bg-burgundy-950/60 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-burgundy-400/60 hover:shadow-lg hover:shadow-burgundy-950/30">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-burgundy-400/15 text-burgundy-300 transition-colors group-hover:bg-burgundy-400 group-hover:text-burgundy-950">
                <GraduationCap size={30} />
              </div>

              <h4 className="mt-5 text-xl font-bold text-white">
                I&apos;m a Student
              </h4>

              <p className="mt-3 text-sm leading-6 text-burgundy-100/70">
                Discover expert tutors and find the right guidance to achieve
                your learning goals.
              </p>

              <Link
                href="/sign-up"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-burgundy-400 px-5 py-3.5 text-sm font-bold text-burgundy-950 shadow-lg shadow-burgundy-950/20 transition-all duration-300 hover:-translate-y-1 hover:bg-burgundy-300"
              >
                Join as Student
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Tutor Card */}
            <div className="group rounded-2xl border border-burgundy-700/60 bg-burgundy-950/60 p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-burgundy-400/60 hover:shadow-lg hover:shadow-burgundy-950/30">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-burgundy-400/15 text-burgundy-300 transition-colors group-hover:bg-burgundy-400 group-hover:text-burgundy-950">
                <BookOpen size={30} />
              </div>

              <h4 className="mt-5 text-xl font-bold text-white">
                I&apos;m a Tutor
              </h4>

              <p className="mt-3 text-sm leading-6 text-burgundy-100/70">
                Share your expertise, inspire learners, and grow your teaching
                career with MentorLagbe.
              </p>

              <Link
                href="/sign-up"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-burgundy-400 px-5 py-3.5 text-sm font-bold text-burgundy-950 shadow-lg shadow-burgundy-950/20 transition-all duration-300 hover:-translate-y-1 hover:bg-burgundy-300"
              >
                Join as Tutor
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
