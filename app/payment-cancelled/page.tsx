import Link from "next/link"
import { XCircle, ArrowRight } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata = { title: "Checkout Cancelled" }

export default function PaymentCancelledPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <XCircle className="size-8" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight">
          Checkout cancelled
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your payment was not completed and you have not been charged. You can
          try again whenever you are ready.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/pricing" className={buttonVariants({})}>
            Back to pricing <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Go to dashboard
          </Link>
        </div>
      </Card>
    </main>
  )
}
