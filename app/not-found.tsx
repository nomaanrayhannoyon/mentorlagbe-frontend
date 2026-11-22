import Link from "next/link"
import { Compass, ArrowLeft } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-burgundy-500/10 text-burgundy-600">
        <Compass className="size-8" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={cn(buttonVariants({}))}>
          <ArrowLeft /> Back home
        </Link>
        <Link
          href="/tuitions"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Browse tuitions
        </Link>
      </div>
    </main>
  )
}
