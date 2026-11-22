import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { z } from "zod"

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    details ? { error: message, details } : { error: message },
    { status }
  )
}

export function validationError(error: z.ZodError) {
  return jsonError("Validation failed", 422, error.flatten())
}

/** Parse a Mongo ObjectId string or return null. */
export function toObjectId(value: string): ObjectId | null {
  try {
    return new ObjectId(value)
  } catch {
    return null
  }
}
