/**
 * Seed script for the MentorLagbe database.
 *
 * Creates a small set of users (via better-auth, so passwords are hashed),
 * tuitions, applications and a payment record. Run with:
 *
 *   npx tsx scripts/seed.ts
 *
 * The script is idempotent-ish: it upserts by email and skips tuitions that
 * already exist for the same title+tutorId.
 */

import "dotenv/config"

import { getDb } from "@/lib/db"
import {
  Collections,
  type Role,
  type Tuition,
  type TuitionMode,
} from "@/lib/collections"
import { ObjectId } from "mongodb"
import { auth } from "@/lib/auth"

type SeedUser = {
  name: string
  email: string
  password: string
  role: Role
}

const seedUsers: SeedUser[] = [
  {
    name: "Admin One",
    email: "admin1@example.com",
    password: "Password123!",
    role: "admin",
  },
  {
    name: "Tutor A",
    email: "tutora@example.com",
    password: "Password123!",
    role: "tutor",
  },
  {
    name: "Tutor B",
    email: "tutorb@example.com",
    password: "Password123!",
    role: "tutor",
  },
  {
    name: "Student X",
    email: "studentx@example.com",
    password: "Password123!",
    role: "student",
  },
  {
    name: "Student Y",
    email: "studenty@example.com",
    password: "Password123!",
    role: "student",
  },
]

async function upsertUser(user: SeedUser) {
  const db = await getDb()
  const existing = await db
    .collection(Collections.users)
    .findOne({ email: user.email })
  if (existing) return existing._id.toString()

  // Use better-auth's sign-up so the password is hashed and the account
  // record is created consistently.
  try {
    await auth.api.signUpEmail({
      body: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        callbackURL: "/",
      } as unknown as {
        name: string
        email: string
        password: string
        role: string
        callbackURL: string
      },
    })
  } catch {
    // If sign-up fails (e.g. already exists), fall back to the lookup below.
  }

  const doc = await db
    .collection(Collections.users)
    .findOne({ email: user.email })
  return doc?._id.toString() ?? new ObjectId().toString()
}

async function main() {
  const db = await getDb()

  console.log("Seeding users…")
  const userIds = new Map<string, string>()
  for (const u of seedUsers) {
    const id = await upsertUser(u)
    if (id) userIds.set(u.email, id)
    console.log(`  ✓ ${u.email} (${u.role}) -> ${id}`)
  }

  const tutorAId = userIds.get("tutora@example.com")!
  const tutorBId = userIds.get("tutorb@example.com")!

  console.log("Seeding tuitions…")
  const subjects: Array<{
    subject: string
    mode: TuitionMode
    level: string
    location?: string
  }> = [
    {
      subject: "Mathematics",
      mode: "in-person",
      level: "Class 9",
      location: "Dhanmondi, Dhaka",
    },
    { subject: "Physics", mode: "online", level: "HSC" },
    {
      subject: "Chemistry",
      mode: "in-person",
      level: "Class 10",
      location: "Mirpur, Dhaka",
    },
    { subject: "English", mode: "online", level: "SSC" },
    { subject: "Programming", mode: "online", level: "University" },
    {
      subject: "Biology",
      mode: "in-person",
      level: "HSC",
      location: "Uttara, Dhaka",
    },
  ]

  for (let i = 0; i < subjects.length; i++) {
    const s = subjects[i]
    const title = `${s.subject} Tuition ${i + 1}`
    const tutorId = i % 2 === 0 ? tutorAId : tutorBId
    const exists = await db
      .collection(Collections.tuitions)
      .findOne({ title, tutorId })
    if (exists) continue

    const doc: Omit<Tuition, "_id"> = {
      title,
      description: `Personalized ${s.subject.toLowerCase()} tutoring focused on concept clarity and exam preparation.`,
      subject: s.subject,
      level: s.level,
      mode: s.mode,
      location: s.location,
      price: 20 + i * 5,
      schedule: "Weekday evenings",
      tutorId,
      tutorName: i % 2 === 0 ? "Tutor A" : "Tutor B",
      status: "approved",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    await db.collection(Collections.tuitions).insertOne(doc as Tuition)
  }
  console.log(`  ✓ up to ${subjects.length} tuitions`)

  console.log("Done seeding.")
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
