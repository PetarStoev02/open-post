"use client"

import * as React from "react"
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

type Platform = "twitter" | "instagram" | "linkedin"
type PostStatus = "scheduled" | "draft" | "publishing"

interface Post {
  id: string
  platform: Platform
  time: string
  content: string
  status: PostStatus
}

interface DayData {
  date: Date
  dayNumber: number
  isToday: boolean
  isCurrentMonth: boolean
  posts: Post[]
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

const statusStyles: Record<PostStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  scheduled: { label: "Scheduled", variant: "secondary" },
  draft: { label: "Draft", variant: "outline" },
  publishing: { label: "Publishing now", variant: "default" },
}

// Sample data
const samplePosts: Record<string, Post[]> = {
  "2026-02-03": [
    {
      id: "1",
      platform: "twitter",
      time: "9:00 AM",
      content: "New blog post: Top 10 social media trends for 2026",
      status: "scheduled",
    },
    {
      id: "2",
      platform: "instagram",
      time: "2:00 PM",
      content: "Behind the scenes of our latest photoshoot",
      status: "scheduled",
    },
  ],
  "2026-02-04": [
    {
      id: "3",
      platform: "linkedin",
      time: "10:30 AM",
      content: "How we increased engagement by 300% - a case study thread",
      status: "draft",
    },
  ],
  "2026-02-05": [
    {
      id: "4",
      platform: "twitter",
      time: "11:00 AM",
      content: "Quick tip: Best times to post on each platform",
      status: "scheduled",
    },
  ],
  "2026-02-06": [
    {
      id: "5",
      platform: "instagram",
      time: "2:30 PM",
      content: "Excited to announce our new feature launch!",
      status: "publishing",
    },
    {
      id: "6",
      platform: "twitter",
      time: "5:00 PM",
      content: "Product showcase carousel - 5 slides ready to go!",
      status: "scheduled",
    },
  ],
  "2026-02-07": [
    {
      id: "7",
      platform: "linkedin",
      time: "9:00 AM",
      content: "5 tips for building a strong personal brand",
      status: "scheduled",
    },
    {
      id: "8",
      platform: "twitter",
      time: "3:00 PM",
      content: "Weekend vibes - What are you working on?",
      status: "scheduled",
    },
  ],
  "2026-02-08": [
    {
      id: "9",
      platform: "instagram",
      time: "12:00 PM",
      content: "Saturday spotlight: Team member feature",
      status: "scheduled",
    },
  ],
  "2026-02-14": [
    {
      id: "10",
      platform: "instagram",
      time: "10:00 AM",
      content: "Happy Valentine's Day! Share the love",
      status: "scheduled",
    },
  ],
  "2026-02-20": [
    {
      id: "11",
      platform: "twitter",
      time: "9:00 AM",
      content: "Friday motivation thread incoming",
      status: "scheduled",
    },
  ],
  "2026-02-25": [
    {
      id: "12",
      platform: "linkedin",
      time: "11:00 AM",
      content: "End of month wrap-up: What we learned",
      status: "draft",
    },
  ],
}

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]
}

function getWeekDays(date: Date): DayData[] {
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
      posts: samplePosts[dateKey] || [],
    })
  }

  return days
}

function getMonthDays(date: Date): DayData[] {
  const today = new Date()
  const year = date.getFullYear()
  const month = date.getMonth()

  // First day of the month
  const firstDay = new Date(year, month, 1)
  // Last day of the month
  const lastDay = new Date(year, month + 1, 0)

  // Start from the Sunday of the week containing the first day
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  // End on the Saturday of the week containing the last day
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
      posts: samplePosts[dateKey] || [],
    })

    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  const PlatformIcon = platformIcons[post.platform]
  const statusStyle = statusStyles[post.status]

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 rounded border bg-card px-2 py-1 text-xs">
        <PlatformIcon className={cn("size-3", platformColors[post.platform])} />
        <span className="truncate">{post.time}</span>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <PlatformIcon className={cn("size-3.5", platformColors[post.platform])} />
          <span className="text-xs text-muted-foreground">{post.time}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-6">
              <MoreHorizontalIcon className="size-3.5" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Reschedule</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="mb-2 line-clamp-3 text-sm">{post.content}</p>
      <Badge variant={statusStyle.variant} className="text-xs">
        {statusStyle.label}
      </Badge>
    </div>
  )
}

function WeekDayColumn({ day, dayName }: { day: DayData; dayName: string }) {
  return (
    <div className="flex min-h-[500px] flex-col border-r last:border-r-0">
      <div
        className={cn(
          "flex h-12 flex-col items-center justify-center border-b px-2 py-1",
          day.isToday && "bg-primary text-primary-foreground"
        )}
      >
        <span className="text-xs font-medium">{dayName}</span>
        <span className="text-sm font-semibold">{day.dayNumber}</span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-2">
        {day.posts.length === 0 ? (
          <button className="flex h-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
            <PlusIcon className="size-5" />
            <span className="text-xs">Add post</span>
          </button>
        ) : (
          <>
            {day.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function MonthDayCell({ day }: { day: DayData }) {
  return (
    <div
      className={cn(
        "flex min-h-[120px] flex-col border-b border-r p-2",
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
          <PostCard key={post.id} post={post} compact />
        ))}
        {day.posts.length > 3 && (
          <span className="text-xs text-muted-foreground">
            +{day.posts.length - 3} more
          </span>
        )}
      </div>
    </div>
  )
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function ContentCalendar() {
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 1, 6)) // February 6, 2026
  const [view, setView] = React.useState<"week" | "month">("week")

  const weekDays = getWeekDays(currentDate)
  const monthDays = getMonthDays(currentDate)

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
          <Button>
            <PlusIcon className="size-4" />
            Schedule Post
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        {view === "week" ? (
          <div className="grid min-w-[900px] grid-cols-7 border-b">
            {weekDays.map((day, index) => (
              <WeekDayColumn key={day.date.toISOString()} day={day} dayName={dayNames[index]} />
            ))}
          </div>
        ) : (
          <div className="min-w-[900px]">
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
            {/* Month grid */}
            <div className="grid grid-cols-7">
              {monthDays.map((day) => (
                <MonthDayCell key={day.date.toISOString()} day={day} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
