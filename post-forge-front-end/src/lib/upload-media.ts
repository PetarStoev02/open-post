import { BACKEND_ORIGIN } from "@/lib/config"

export const uploadMedia = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${BACKEND_ORIGIN}/api/media/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.message ?? "Upload failed")
  }

  const data: { url: string } = await response.json()
  return data.url
}
