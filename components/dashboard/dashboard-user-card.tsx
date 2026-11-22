import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import type { Role } from "@/lib/types"

const roleLabel: Record<Role, string> = {
  student: "Student",
  tutor: "Tutor",
  admin: "Administrator",
}

const roleBadgeClass: Record<Role, string> = {
  student: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
  tutor:
    "border-burgundy-500/30 bg-burgundy-500/10 text-burgundy-700 dark:text-burgundy-400",
  admin:
    "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
}

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?"
  )
}

export function DashboardUserCard({
  name,
  email,
  role,
  plan,
  image,
  href = "/profile",
}: {
  name: string
  email: string
  role: Role
  plan?: "free" | "pro"
  image?: string | null
  href?: string
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border bg-card p-4 shadow-sm transition-colors hover:border-burgundy-300 dark:hover:border-burgundy-800"
    >
      <div className="flex items-center gap-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="size-10 shrink-0 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-burgundy-600 text-sm font-bold text-white">
            {getInitials(name)}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="outline" className={`w-fit ${roleBadgeClass[role]}`}>
          {roleLabel[role]}
        </Badge>
        {plan && (
          <Badge
            variant="outline"
            className={
              plan === "pro"
                ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : "border-gray-300/50 bg-gray-500/10 text-gray-600 dark:text-gray-400"
            }
          >
            {plan === "pro" ? "Pro" : "Free"}
          </Badge>
        )}
      </div>
    </Link>
  )
}
