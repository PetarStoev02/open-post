import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const AccountsSkeleton = () => (
  <div className="flex flex-1 flex-col gap-6 p-6">
    {/* Page header */}
    <div className="flex flex-col gap-1">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-80" />
    </div>

    {/* Connect buttons */}
    <div className="flex flex-wrap gap-2">
      <Skeleton className="h-8 w-36 rounded-md" />
      <Skeleton className="h-8 w-36 rounded-md" />
      <Skeleton className="h-8 w-36 rounded-md" />
    </div>

    {/* Account cards grid */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-5 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)

export { AccountsSkeleton }
