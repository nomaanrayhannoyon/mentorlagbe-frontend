"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function ErrorContent() {
  const params = useSearchParams()
  const code = params.get("error") || "UNKNOWN"
  const description = params.get("error_description")

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-8" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Sign-in could not be completed
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {description
          ? description
          : "Something went wrong while signing you in. Please try again."}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">Error code: {code}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/sign-in" className={cn(buttonVariants({}))}>
          Back to sign in
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
          Back home
        </Link>
      </div>
    </main>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          Loading…
        </main>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}
