"use client"

import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@apollo/client/react"
import {
  GridIcon,
  ImageIcon,
  LibraryIcon,
  ListIcon,
  VideoIcon,
} from "lucide-react"

import type { GetPostsResponse } from "@/types/post"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/empty-state"
import { GET_POSTS } from "@/graphql/operations/posts"

type MediaItem = {
  url: string
  type: "image" | "video"
  postContent: string
  date: string
}

const isVideo = (url: string) => /\.(mp4|mov)(\?|$)/i.test(url)

const ContentLibraryPage = () => {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [typeFilter, setTypeFilter] = React.useState<"all" | "image" | "video">("all")
  const [previewItem, setPreviewItem] = React.useState<MediaItem | null>(null)

  const { data, loading } = useQuery<GetPostsResponse>(GET_POSTS, {
    fetchPolicy: "cache-and-network",
  })

  const mediaItems = React.useMemo((): Array<MediaItem> => {
    if (!data?.posts) return []
    const items: Array<MediaItem> = []
    for (const post of data.posts) {
      for (const url of post.mediaUrls) {
        items.push({
          url,
          type: isVideo(url) ? "video" : "image",
          postContent: post.content,
          date: post.createdAt,
        })
      }
    }
    return items
  }, [data])

  const filteredItems = React.useMemo(() => {
    if (typeFilter === "all") return mediaItems
    return mediaItems.filter((item) => item.type === typeFilter)
  }, [mediaItems, typeFilter])

  if (loading && !data) {
    return (
      <div className="flex h-full flex-col">
        <div className="border-b px-6 py-4">
          <h1 className="text-2xl font-semibold">Content Library</h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-sm text-muted-foreground">Loading media...</div>
        </div>
      </div>
    )
  }

  if (mediaItems.length === 0) {
    return (
      <EmptyState
        icon={<LibraryIcon className="size-8" />}
        title="Content Library"
        description="No media found. Upload images or videos when creating posts and they'll appear here."
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-2xl font-semibold">Content Library</h1>
        <div className="flex items-center gap-3">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as "all" | "image" | "video")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as "grid" | "list")}
            className="rounded-lg border"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <GridIcon className="size-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <ListIcon className="size-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? "item" : "items"}
        </p>

        {viewMode === "grid" ? (
          /* Grid View */
          <div className="columns-2 gap-4 space-y-4 sm:columns-3 lg:columns-4">
            {filteredItems.map((item) => (
              <button
                key={item.url}
                type="button"
                className="group relative block w-full break-inside-avoid overflow-hidden rounded-lg border bg-muted transition-shadow hover:shadow-md"
                onClick={() => setPreviewItem(item)}
              >
                {item.type === "video" ? (
                  <video src={item.url} className="w-full object-cover" muted />
                ) : (
                  <img src={item.url} alt="" className="w-full object-cover" loading="lazy" />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex items-center gap-1 text-[10px] text-white">
                    {item.type === "video" ? <VideoIcon className="size-3" /> : <ImageIcon className="size-3" />}
                    {item.type === "video" ? "Video" : "Image"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* List View */
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Preview</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Source Post</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow
                  key={item.url}
                  className="cursor-pointer"
                  onClick={() => setPreviewItem(item)}
                >
                  <TableCell>
                    <div className="size-12 overflow-hidden rounded border bg-muted">
                      {item.type === "video" ? (
                        <video src={item.url} className="size-full object-cover" muted />
                      ) : (
                        <img src={item.url} alt="" className="size-full object-cover" loading="lazy" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs">
                      {item.type === "video" ? <VideoIcon className="size-3" /> : <ImageIcon className="size-3" />}
                      {item.type === "video" ? "Video" : "Image"}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-xs">{item.postContent}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(item.date.replace(" ", "T")).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={previewItem !== null} onOpenChange={(open) => !open && setPreviewItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="sr-only">Media Preview</DialogTitle>
          <DialogDescription className="sr-only">Preview of selected media item</DialogDescription>
          {previewItem && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg bg-muted">
                {previewItem.type === "video" ? (
                  <video src={previewItem.url} className="max-h-[60vh] w-full" controls />
                ) : (
                  <img src={previewItem.url} alt="" className="max-h-[60vh] w-full object-contain" />
                )}
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">{previewItem.postContent}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const Route = createFileRoute("/content-library")({
  component: ContentLibraryPage,
})
