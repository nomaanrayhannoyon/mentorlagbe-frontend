"use client"

import { useState } from "react"
import Image from "next/image"
import { Bookmark, Globe, MapPin } from "lucide-react"

import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { Tuition } from "@/lib/tuitions"

function TuitionCard({ tuition }: { tuition: Tuition }) {
  const [saved, setSaved] = useState(false)
  const isOnline = tuition.mode === "online"

  return (
    <Card className="group gap-3 p-3 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-burgundy-500/40">
      <div className="relative overflow-hidden rounded-xl">
        <Image
          src={tuition.image}
          alt={`${tuition.subject} tuition session`}
          width={800}
          height={400}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="aspect-[2/1] w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Mode badge */}
        <Badge
          variant="outline"
          className={cn(
            "absolute top-2.5 left-2.5 h-auto px-3 py-1.5 shadow-sm backdrop-blur",
            isOnline
              ? "border-transparent bg-burgundy-600 text-white"
              : "border-transparent bg-black/75 text-white"
          )}
        >
          {isOnline ? (
            <Globe aria-hidden />
          ) : (
            <MapPin aria-hidden className="text-burgundy-400" />
          )}
          {isOnline ? "Online" : tuition.location}
        </Badge>

        {/* Bookmark toggle */}
        <button
          type="button"
          aria-pressed={saved}
          aria-label={
            saved
              ? `Remove ${tuition.subject} from saved tuitions`
              : `Save ${tuition.subject}`
          }
          onClick={() => setSaved((value) => !value)}
          className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur transition-colors hover:bg-black/90 focus-visible:ring-2 focus-visible:ring-burgundy-400 focus-visible:outline-none"
        >
          <Bookmark
            aria-hidden
            className={cn("size-4", saved && "fill-current")}
          />
        </button>
      </div>

      {/* Subject + class level */}
      <div className="flex items-center justify-between gap-2 px-1 pb-1">
        <Badge
          variant="outline"
          className="h-auto rounded-lg border-burgundy-500/40 bg-burgundy-500/10 px-3 py-1.5 text-burgundy-700 dark:text-burgundy-300"
        >
          {tuition.subject}
        </Badge>
        <span className="truncate text-right text-sm text-muted-foreground">
          {tuition.level}
        </span>
      </div>
    </Card>
  )
}

export { TuitionCard }
