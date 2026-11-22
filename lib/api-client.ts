"use client"

/**
 * Small fetch wrapper for the app's JSON APIs.
 *
 * - Always sends credentials (cookies) so better-auth sessions work.
 * - Parses JSON automatically.
 * - Throws a typed ApiError with the server's `error` message so callers can
 *   surface friendly toasts.
 */

import { toast } from "sonner"

export class ApiError extends Error {
  status: number
  details?: unknown
  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.details = details
  }
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown
  json?: boolean
}

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, json = true, ...rest } = options

  const headers = new Headers(rest.headers)
  let payload: BodyInit | undefined

  if (body !== undefined) {
    if (body instanceof FormData) {
      payload = body
    } else if (json) {
      headers.set("Content-Type", "application/json")
      payload = JSON.stringify(body)
    } else {
      payload = body as BodyInit
    }
  }

  const res = await fetch(url, {
    ...rest,
    headers,
    body: payload,
  })

  const contentType = res.headers.get("content-type") ?? ""
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data
        ? String((data as { error: unknown }).error)
        : undefined) ??
      res.statusText ??
      "Request failed"
    throw new ApiError(message, res.status, data)
  }

  return data as T
}

/**
 * Fetch with toast notifications for error states. Returns `null` on error
 * (after showing a toast) so callers can treat it as "no data".
 */
export async function apiFetchToast<T = unknown>(
  url: string,
  options: RequestOptions = {},
  successMessage?: string
): Promise<T | null> {
  try {
    const data = await apiFetch<T>(url, options)
    if (successMessage) toast.success(successMessage)
    return data
  } catch (err) {
    const message =
      err instanceof ApiError ? err.message : "Something went wrong"
    toast.error(message)
    return null
  }
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return "Something went wrong"
}
