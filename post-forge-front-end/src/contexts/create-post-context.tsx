"use client"

import * as React from "react"
import type { Platform } from "@/types/post"

type OpenSheetOptions = {
  date?: Date
  platforms?: Platform[]
}

type CreatePostContextType = {
  isOpen: boolean
  openSheet: (options?: OpenSheetOptions) => void
  closeSheet: () => void
  preselectedDate?: Date
  preselectedPlatforms?: Platform[]
}

const CreatePostContext = React.createContext<CreatePostContextType | undefined>(undefined)

export const CreatePostProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [preselectedDate, setPreselectedDate] = React.useState<Date | undefined>()
  const [preselectedPlatforms, setPreselectedPlatforms] = React.useState<Platform[] | undefined>()

  const openSheet = React.useCallback((options?: OpenSheetOptions) => {
    setPreselectedDate(options?.date)
    setPreselectedPlatforms(options?.platforms)
    setIsOpen(true)
  }, [])

  const closeSheet = React.useCallback(() => {
    setIsOpen(false)
    setPreselectedDate(undefined)
    setPreselectedPlatforms(undefined)
  }, [])

  return (
    <CreatePostContext.Provider value={{ isOpen, openSheet, closeSheet, preselectedDate, preselectedPlatforms }}>
      {children}
    </CreatePostContext.Provider>
  )
}

export const useCreatePost = () => {
  const context = React.useContext(CreatePostContext)
  if (!context) {
    throw new Error("useCreatePost must be used within CreatePostProvider")
  }
  return context
}
