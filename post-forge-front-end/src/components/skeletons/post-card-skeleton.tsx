import { Skeleton } from "@/components/ui/skeleton"

export const PostCardSkeleton = () => (
  <div className="flex flex-col overflow-hidden rounded-lg border">
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
    <div className="flex items-center justify-end gap-1 border-t px-3 py-2">
      <Skeleton className="size-8 rounded" />
      <Skeleton className="size-8 rounded" />
      <Skeleton className="size-8 rounded" />
    </div>
  </div>
)
