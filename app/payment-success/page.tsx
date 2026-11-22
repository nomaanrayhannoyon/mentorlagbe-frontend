import Link from "next/link"
import { CheckCircle2, ArrowRight, Crown } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata = { title: "Payment Successful" }

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-burgundy-500/10 text-burgundy-600 dark:bg-burgundy-500/15 dark:text-burgundy-400">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">
          Payment successful
        </h1>
        <p className="mt-2 text-muted-foreground">
          Thank you for upgrading to MentorLagbe Pro. Your account will be
          activated as soon as the payment is confirmed.
        </p>
        <div className="mt-6 rounded-xl bg-burgundy-500/10 p-4 text-left text-sm text-burgundy-700 dark:text-burgundy-300">
          <p className="flex items-center gap-2 font-semibold">
            <Crown className="size-4" /> Pro membership
          </p>
          <p className="mt-1 text-muted-foreground">
            Unlimited tuition posts and bookmarks are now available once your
            plan updates.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/dashboard" className={buttonVariants({})}>
            Go to dashboard <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/tuitions"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Browse tuitions
          </Link>
        </div>
      </Card>
    </main>
  )
}
