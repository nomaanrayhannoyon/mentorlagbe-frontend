import type { Plan } from "@/lib/collections"

/**
 * Membership plan limits.
 *
 * These are enforced on the SERVER (never trusted from the client) in the
 * tuition creation and profile-update handlers.
 */
export const PLAN_LIMITS = {
  free: {
    /** Free tutors may post at most this many tuitions (active + pending). */
    maxTuitionPosts: 2,
    /** Free students may bookmark at most this many tuitions. */
    maxBookmarks: 5,
    label: "Free",
  },
  pro: {
    /** Pro tutors have unlimited tuition posts. */
    maxTuitionPosts: Number.POSITIVE_INFINITY,
    maxBookmarks: Number.POSITIVE_INFINITY,
    label: "Pro",
  },
} as const

export function getPlanLimits(plan: Plan) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free
}

/** True when the plan allows posting another tuition. */
export function canPostTuition(plan: Plan, currentPostCount: number): boolean {
  const { maxTuitionPosts } = getPlanLimits(plan)
  return currentPostCount < maxTuitionPosts
}

/** True when the plan allows saving another bookmark. */
export function canBookmark(plan: Plan, currentBookmarkCount: number): boolean {
  const { maxBookmarks } = getPlanLimits(plan)
  return currentBookmarkCount < maxBookmarks
}

/** Human-readable upgrade hint shown when a limit is hit. */
export function planLimitMessage(kind: "posts" | "bookmarks", plan: Plan) {
  const { maxTuitionPosts, maxBookmarks } = getPlanLimits(plan)
  const limit = kind === "posts" ? maxTuitionPosts : maxBookmarks
  return (
    `Your ${plan} plan allows ${limit} ${kind}. ` +
    "Upgrade to Pro for unlimited access."
  )
}
