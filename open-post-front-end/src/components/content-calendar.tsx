"use client"

import * as React from "react"
import { useQuery, useMutation } from "@apollo/client/react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MoreHorizontalIcon,
  TwitterIcon,
  InstagramIcon,
  LinkedinIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { useCreatePost } from "@/contexts/create-post-context"
import { usePostActions } from "@/contexts/post-actions-context"
import { GET_CALENDAR_POSTS, CREATE_POST } from "@/graphql/operations/posts"
import type { Platform as APIPlatform, PostStatus as APIPostStatus, GetCalendarPostsResponse, Post, CreatePostInput } from "@/types/post"

type Platform = "twitter" | "instagram" | "linkedin"
type PostStatus = "draft" | "scheduled" | "pending" | "published" | "cancelled" | "failed"

interface CalendarPost {
  id: string
  platforms: Platform[]
  time: string
  content: string
  status: PostStatus
  fullPost: Post // Store the full post for detail view
}

interface DayData {
  date: Date
  dayNumber: number
  isToday: boolean
  isCurrentMonth: boolean
  posts: CalendarPost[]
}

const platformIcons: Record<Platform, React.ComponentType<{ className?: string }>> = {
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
}

const platformColors: Record<Platform, string> = {
  twitter: "text-[#000000]",
  instagram: "text-[#E4405F]",
  linkedin: "text-[#0A66C2]",
}

const statusStyles: Record<PostStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-700 border-slate-200" },
  scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-700 border-blue-200" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  published: { label: "Published", className: "bg-green-100 text-green-700 border-green-200" },
  cancelled: { label: "Cancelled", className: "bg-gray-100 text-gray-500 border-gray-200" },
  failed: { label: "Failed", className: "bg-red-100 text-red-700 border-red-200" },
}

function formatDateKey(date: Date): string {
  // Use local date to avoid timezone shift (toISOString converts to UTC)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatTime(dateString: string): string {
  // Handle both ISO format (T separator) and Laravel format (space separator)
  const normalizedDate = dateString.replace(" ", "T")
  const date = new Date(normalizedDate)
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

function transformPlatform(platform: APIPlatform): Platform {
  return platform.toLowerCase() as Platform
}

function transformStatus(status: APIPostStatus): PostStatus {
  return status.toLowerCase() as PostStatus
}

function getWeekDays(date: Date, postsMap: Record<string, CalendarPost[]>): DayData[] {
  const today = new Date()
  const startOfWeek = new Date(date)
  const day = startOfWeek.getDay()
  startOfWeek.setDate(startOfWeek.getDate() - day)

  const days: DayData[] = []

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek)
    currentDate.setDate(startOfWeek.getDate() + i)
    const dateKey = formatDateKey(currentDate)

    days.push({
      date: currentDate,
      dayNumber: currentDate.getDate(),
      isToday:
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear(),
      isCurrentMonth: currentDate.getMonth() === date.getMonth(),
      posts: postsMap[dateKey] || [],
    })
  }

  return days
}

function getMonthDays(date: Date, postsMap: Record<string, CalendarPost[]>): DayData[] {
  const today = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const endDate = new Date(lastDay)
  endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

  const days: DayData[] = []
  const currentDate = new Date(startDate)

  while (currentDate <= endDate) {
    const dateKey = formatDateKey(currentDate)

    days.push({
      date: new Date(currentDate),
      dayNumber: currentDate.getDate(),
      isToday:
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear(),
      isCurrentMonth: currentDate.getMonth() === month,
      posts: postsMap[dateKey] || [],
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function PostCard({ post, compact = false, onDuplicate }: { post: CalendarPost; compact?: boolean; onDuplicate?: () => void }) {
  const { openPost, editPost, reschedulePost, deletePost } = usePostActions()
  const statusStyle = statusStyles[post.status]

  if (compact) {
    return (
      <button
        onClick={() => openPost(post.fullPost)}
        className="flex w-full flex-col gap-0.5 rounded border bg-card px-2 py-1.5 text-xs text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            {post.platforms.map((platform) => {
              const Icon = platformIcons[platform]
              return <Icon key={platform} className={cn("size-3", platformColors[platform])} />
            })}
          </div>
          <span className="text-muted-foreground">{post.time}</span>
        </div>
        <span className="line-clamp-2 text-[11px] leading-tight">{post.content}</span>
      </button>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-2.5 shadow-sm">
      <div className="mb-1.5 flex items-start justify-between gap-1">
        <button
          onClick={() => openPost(post.fullPost)}
          className="flex items-center gap-1.5 hover:opacity-70 transition-opacity min-w-0"
        >
          <div className="flex items-center gap-1 shrink-0">
            {post.platforms.map((platform) => {
              const Icon = platformIcons[platform]
              return <Icon key={platform} className={cn("size-3.5", platformColors[platform])} />
            })}
          </div>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap">{post.time}</span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-5 shrink-0">
              <MoreHorizontalIcon className="size-3" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => editPost(post.fullPost)}>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem onClick={() => reschedulePost(post.fullPost)}>Reschedule</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => deletePost(post.fullPost)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <button
        onClick={() => openPost(post.fullPost)}
        className="mb-1.5 text-xs text-left w-full hover:opacity-70 transition-opacity break-words line-clamp-4"
      >
        {post.content}
      </button>
      <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", statusStyle.className)}>
        {statusStyle.label}
      </Badge>
    </div>
  )
}

// Timeline spans full 24 hours (12 AM to 12 AM)
const timelineHours = Array.from({ length: 25 }, (_, i) => i) // 0-24 for grid lines
const TIMELINE_START_HOUR = 0
const TIMELINE_HOURS_COUNT = 24

function getHourFromTime(timeString: string | null | undefined): number {
  if (!timeString) return 8 // default to 8 AM
  const normalizedDate = timeString.replace(" ", "T")
  const date = new Date(normalizedDate)
  return date.getHours() + date.getMinutes() / 60
}

function WeekDayColumn({ day, dayName, onAddPost, onDuplicate }: { day: DayData; dayName: string; onAddPost: (date: Date) => void; onDuplicate: (post: Post) => void }) {
  return (
    <div className="group flex flex-1 flex-col border-r last:border-r-0 min-w-[140px]">
      <div
        className={cn(
          "flex h-14 flex-col items-center justify-center border-b px-2 py-1 sticky top-0 bg-background z-10",
          day.isToday && "bg-primary text-primary-foreground"
        )}
      >
        <span className="text-xs font-medium">{dayName}</span>
        <span className="text-lg font-semibold">{day.dayNumber}</span>
      </div>
      <div className="relative min-h-[1200px]">
        {/* Hour grid lines - 24 hours + extra row at bottom */}
        {timelineHours.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-muted/30"
            style={{ top: `${(hour / 25) * 100}%` }}
          />
        ))}
        {/* Bottom border for the extra row */}
        <div
          className="absolute left-0 right-0 border-t border-muted/30"
          style={{ top: '100%' }}
        />
        {/* Posts positioned by time */}
        {day.posts.map((post) => {
          const hour = getHourFromTime(post.fullPost.scheduledAt)
          const topPercent = (hour / 25) * 100
          return (
            <div
              key={post.id}
              className="absolute left-1 right-1 z-10"
              style={{ top: `${topPercent}%` }}
            >
              <PostCard post={post} onDuplicate={() => onDuplicate(post.fullPost)} />
            </div>
          )
        })}
        {/* Add post button on hover */}
        <button
          onClick={() => onAddPost(day.date)}
          className={cn(
            "absolute bottom-2 left-1 right-1 flex h-10 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-transparent text-muted-foreground transition-all z-20",
            "opacity-0 group-hover:opacity-100 hover:border-muted-foreground/50 hover:bg-muted/50"
          )}
        >
          <PlusIcon className="size-4" />
          <span className="text-xs">Add post</span>
        </button>
      </div>
    </div>
  )
}

function TimelineColumn() {
  return (
    <div className="flex flex-col w-20 border-r bg-muted/20 shrink-0">
      <div className="h-14 border-b sticky top-0 bg-muted/20 z-10" />
      <div className="relative min-h-[1200px]">
        {/* Hour labels 0-24 */}
        {timelineHours.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 flex items-start justify-end pr-3 -translate-y-2"
            style={{ top: `${(hour / 25) * 100}%` }}
          >
            <span className="text-xs text-muted-foreground font-medium">
              {hour.toString().padStart(2, "0")}:00
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MonthDayCell({ day, onAddPost, onDuplicate }: { day: DayData; onAddPost: (date: Date) => void; onDuplicate: (post: Post) => void }) {
  return (
    <div
      className={cn(
        "group flex flex-1 flex-col border-b border-r p-2",
        !day.isCurrentMonth && "bg-muted/30"
      )}
    >
      <div
        className={cn(
          "mb-1 flex size-7 items-center justify-center rounded-full text-sm",
          day.isToday && "bg-primary text-primary-foreground font-semibold",
          !day.isCurrentMonth && "text-muted-foreground"
        )}
      >
        {day.dayNumber}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        {day.posts.slice(0, 3).map((post) => (
          <PostCard key={post.id} post={post} compact onDuplicate={() => onDuplicate(post.fullPost)} />
        ))}
        {day.posts.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{day.posts.length - 3} more
          </span>
        )}
        <button
          onClick={() => onAddPost(day.date)}
          className="mt-auto flex items-center justify-center rounded py-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted/50"
        >
          <PlusIcon className="size-4" />
        </button>
      </div>
    </div>
  )
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function ContentCalendar() {
  const [currentDate, setCurrentDate] = React.useState(() => new Date())
  const [view, setView] = React.useState<"week" | "month">("week")
  const { openSheet } = useCreatePost()

  // Calculate date range for the query
  const dateRange = React.useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    if (view === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(endOfWeek.getDate() + 6)
      return {
        startDate: formatDateKey(startOfWeek),
        endDate: formatDateKey(endOfWeek),
      }
    } else {
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      const endDate = new Date(lastDay)
      endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))
      return {
        startDate: formatDateKey(startDate),
        endDate: formatDateKey(endDate),
      }
    }
  }, [currentDate, view])

  // Fetch posts from the backend
  const { data, loading } = useQuery<GetCalendarPostsResponse>(GET_CALENDAR_POSTS, {
    variables: dateRange,
    fetchPolicy: 'cache-and-network',
  })

  // Duplicate post mutation
  const [duplicatePostMutation] = useMutation(CREATE_POST, {
    refetchQueries: 'active',
  })

  const handleDuplicate = React.useCallback((post: Post) => {
    const input: CreatePostInput = {
      content: `Duplicate of: ${post.content}`,
      platforms: post.platforms,
      status: 'DRAFT',
      scheduledAt: post.scheduledAt || undefined,
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
    }
    duplicatePostMutation({ variables: { input } })
  }, [duplicatePostMutation])

  // Transform API data to calendar format
  const postsMap = React.useMemo(() => {
    const map: Record<string, CalendarPost[]> = {}

    if (data?.calendarPosts) {
      for (const post of data.calendarPosts) {
        if (!post.scheduledAt) continue

        // Handle both ISO format (T separator) and Laravel format (space separator)
        const dateKey = post.scheduledAt.split(/[T ]/)[0]
        const calendarPost: CalendarPost = {
          id: post.id,
          platforms: post.platforms.map(transformPlatform),
          time: formatTime(post.scheduledAt),
          content: post.content,
          status: transformStatus(post.status),
          fullPost: post,
        }

        if (!map[dateKey]) {
          map[dateKey] = []
        }
        map[dateKey].push(calendarPost)
      }

      // Sort posts by time within each day (earliest first)
      for (const dateKey of Object.keys(map)) {
        map[dateKey].sort((a, b) => {
          const timeA = a.fullPost.scheduledAt ? new Date(a.fullPost.scheduledAt.replace(' ', 'T')).getTime() : 0
          const timeB = b.fullPost.scheduledAt ? new Date(b.fullPost.scheduledAt.replace(' ', 'T')).getTime() : 0
          return timeA - timeB
        })
      }
    }

    return map
  }, [data])

  const weekDays = getWeekDays(currentDate, postsMap)
  const monthDays = getMonthDays(currentDate, postsMap)

  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (view === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (view === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Content Calendar</h1>
          <div className="flex items-center gap-1 rounded-lg border bg-muted/50 px-2 py-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={goToPrevious}
            >
              <ChevronLeftIcon className="size-4" />
              <span className="sr-only">Previous {view}</span>
            </Button>
            <span className="min-w-[140px] text-center text-sm font-medium">
              {formatMonth(currentDate)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={goToNext}
            >
              <ChevronRightIcon className="size-4" />
              <span className="sr-only">Next {view}</span>
            </Button>
          </div>
          {loading && (
            <span className="text-sm text-muted-foreground">Loading...</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => value && setView(value as "week" | "month")}
            className="rounded-lg border"
          >
            <ToggleGroupItem value="week" className="px-4">
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="month" className="px-4">
              Month
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={() => openSheet()}>
            <PlusIcon className="size-4" />
            Schedule Post
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-1 flex-col overflow-auto">
        {view === "week" ? (
          <div className="flex min-w-[900px] flex-1 border-b">
            <TimelineColumn />
            {weekDays.map((day, index) => (
              <WeekDayColumn key={day.date.toISOString()} day={day} dayName={dayNames[index]} onAddPost={(date) => openSheet(date)} onDuplicate={handleDuplicate} />
            ))}
          </div>
        ) : (
          <div className="flex min-w-[900px] flex-1 flex-col">
            {/* Month header */}
            <div className="grid grid-cols-7 border-b">
              {dayNames.map((name) => (
                <div
                  key={name}
                  className="border-r px-2 py-3 text-center text-sm font-medium text-muted-foreground last:border-r-0"
                >
                  {name}
                </div>
              ))}
            </div>
            {/* Month grid - calculate rows based on number of weeks */}
            <div
              className="grid flex-1 grid-cols-7"
              style={{ gridTemplateRows: `repeat(${Math.ceil(monthDays.length / 7)}, minmax(0, 1fr))` }}
            >
              {monthDays.map((day) => (
                <MonthDayCell key={day.date.toISOString()} day={day} onAddPost={(date) => openSheet(date)} onDuplicate={handleDuplicate} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
