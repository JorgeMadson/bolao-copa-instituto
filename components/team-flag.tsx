import { flagUrl, isPlaceholder } from "@/lib/flags"
import { cn } from "@/lib/utils"

export function TeamFlag({
  team,
  className,
}: {
  team: string
  className?: string
}) {
  const url = flagUrl(team)

  if (!url || isPlaceholder(team)) {
    return (
      <span
        className={cn(
          "inline-flex h-4 w-6 items-center justify-center rounded-[2px] bg-muted text-[8px] font-mono text-muted-foreground",
          className,
        )}
        aria-hidden="true"
      >
        ?
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url || "/placeholder.svg"}
      alt={`Bandeira ${team}`}
      width={24}
      height={16}
      className={cn("h-4 w-6 rounded-[2px] object-cover", className)}
      crossOrigin="anonymous"
    />
  )
}
