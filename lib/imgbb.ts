/**
 * ImgBB image upload helper.
 *
 * Uploads a File to ImgBB and returns the hosted URL. The ImgBB API key is
 * read from IMGBB_API_KEY. When the key is missing, the helper throws a
 * typed error the caller can surface as a friendly message.
 */

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload"

export class ImgbbError extends Error {}

export async function uploadImage(file: File): Promise<string> {
  const key = process.env.IMGBB_API_KEY
  if (!key) {
    throw new ImgbbError(
      "Image uploads are not configured (missing IMGBB_API_KEY)."
    )
  }

  const form = new FormData()
  form.append("key", key)
  form.append("image", file)

  const res = await fetch(IMGBB_ENDPOINT, {
    method: "POST",
    body: form,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new ImgbbError(
      `ImgBB upload failed (${res.status}): ${text.slice(0, 200)}`
    )
  }

  const data = (await res.json()) as {
    data?: { url?: string; display_url?: string }
    error?: { message?: string }
  }

  const url = data.data?.url ?? data.data?.display_url
  if (!url) {
    throw new ImgbbError(data.error?.message ?? "ImgBB returned no image URL.")
  }

  return url
}
