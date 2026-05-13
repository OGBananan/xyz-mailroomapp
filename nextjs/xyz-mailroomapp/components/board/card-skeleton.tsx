import { cn } from "@/lib/utils"

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted/60", className)} />
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-card px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <Shimmer className="mt-0.5 size-6 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <Shimmer className="h-3 w-24" />
            <Shimmer className="ml-auto h-2.5 w-10" />
          </div>
          <Shimmer className="h-4 w-full" />
          <Shimmer className="h-4 w-3/4" />
        </div>
      </div>
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-5/6" />
      <div className="flex items-center justify-between pt-0.5">
        <Shimmer className="h-4 w-20 rounded-md" />
      </div>
    </div>
  )
}

export function ColumnSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
