import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { cn } from "cn"
import { buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/tutors", label: "Find Tutors" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About Us" },
]

const contacts: { icon: LucideIcon; label: string; href?: string }[] = [
  {
    icon: Mail,
    label: "support@mentorlagbe.com",
    href: "mailto:support@mentorlagbe.com",
  },
  { icon: Phone, label: "+880 1234 567890", href: "tel:+8801234567890" },
  { icon: MapPin, label: "Dhaka, Bangladesh" },
]

const socials: { label: string; viewBox: string; d: string }[] = [
  {
    label: "X",
    viewBox: "0 0 512 512",
    d: "M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z",
  },
  {
    label: "Facebook",
    viewBox: "0 0 320 512",
    d: "M80 299.3V512H196V299.3h86.5l18-97.8H196V166.9c0-51.7 20.3-71.5 72.7-71.5c16.3 0 29.4 .4 37 1.2V7.9C291.4 4 256.4 0 236.2 0C129.3 0 80 50.5 80 159.4v42.1H14v97.8H80z",
  },
  {
    label: "YouTube",
    viewBox: "0 0 24 24",
    d: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "LinkedIn",
    viewBox: "0 0 24 24",
    d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
]

const columnHeadingClass = "text-base font-semibold text-white"

const footerLinkClass =
  "text-sm text-white/80 transition-colors hover:text-burgundy-300"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-burgundy-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1.8fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5"
              aria-label="MentorLagbe home"
            >
              <span
                aria-hidden
                className="size-9 bg-white [mask-image:url(/images/logo.svg)] [mask-size:contain] [mask-position:center] [mask-repeat:no-repeat] [-webkit-mask-image:url(/images/logo.svg)] [-webkit-mask-position:center] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:contain]"
              />
              <span className="text-xl font-bold tracking-tight">
                Mentor<span className="text-burgundy-200">Lagbe</span>
              </span>
            </Link>
            <p className="text-sm text-white/60">Learn. Grow. Achieve.</p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick Links" className="flex flex-col gap-4">
            <h2 className={columnHeadingClass}>Quick Links</h2>
            <ul className="flex flex-col gap-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Us */}
          <div className="flex flex-col gap-4">
            <h2 className={columnHeadingClass}>Contact Us</h2>
            <ul className="flex flex-col gap-3">
              {contacts.map(({ icon: Icon, label, href }) => {
                const content = (
                  <>
                    <Icon aria-hidden className="size-4 shrink-0" />
                    <span>{label}</span>
                  </>
                )

                return (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        className={`flex items-center gap-3 text-sm text-white/80 transition-colors hover:text-burgundy-300`}
                      >
                        {content}
                      </a>
                    ) : (
                      <span className="flex items-center gap-3 text-sm text-white/80">
                        {content}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Follow Us */}
          <div className="flex flex-col gap-4">
            <h2 className={columnHeadingClass}>Follow Us</h2>
            <div className="flex items-center gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "text-white hover:bg-white/10 hover:text-burgundy-300 focus-visible:ring-burgundy-400"
                  )}
                >
                  <svg
                    viewBox={social.viewBox}
                    fill="currentColor"
                    aria-hidden
                    className="size-5"
                  >
                    <path d={social.d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <Separator className="mt-10 bg-white/10" />

        <div className="flex flex-col items-center justify-between gap-3 py-4 text-xs text-white/60 sm:flex-row">
          <p>© 2025 MentorLagbe. All rights reserved.</p>
          <p>Built with ❤️ for Better Learning</p>
        </div>
      </div>
    </footer>
  )
}
