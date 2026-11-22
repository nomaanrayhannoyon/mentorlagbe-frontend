import { NextResponse } from "next/server"
import { getApiSession } from "@/lib/authHelper"
import { uploadImage, ImgbbError } from "@/lib/imgbb"
import { jsonError } from "@/lib/api"

/**
 * POST /api/upload
 * Auth-only: upload an image (multipart/form-data, field "image") to ImgBB.
 * Returns the hosted URL. Tutors use this when creating/editing a tuition.
 */
export async function POST(request: Request) {
  const auth = await getApiSession()
  if (!auth.ok) return jsonError(auth.error, auth.status)

  const form = await request.formData().catch(() => null)
  if (!form) return jsonError("Expected multipart/form-data", 400)

  const file = form.get("image")
  if (!(file instanceof File)) {
    return jsonError("Missing file field 'image'", 400)
  }
  if (file.size === 0) return jsonError("Empty file", 400)
  if (file.size > 5 * 1024 * 1024) {
    return jsonError("File too large (max 5MB)", 413)
  }
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowed.includes(file.type)) {
    return jsonError(`Unsupported image type: ${file.type}`, 415)
  }

  try {
    const url = await uploadImage(file)
    return NextResponse.json({ url })
  } catch (err) {
    if (err instanceof ImgbbError) {
      return jsonError(err.message, 503)
    }
    return jsonError("Upload failed", 500)
  }
}