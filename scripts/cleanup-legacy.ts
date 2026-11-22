import "dotenv/config"
import { MongoClient } from "mongodb"

/**
 * One-time cleanup of LEGACY collections left over from before the
 * usePlural switch and the bookmarks-on-user refactor.
 *
 * DESTRUCTIVE: drops the old singular better-auth collections and the old
 * bookmarks collection. Run only on a disposable dev database, after backing
 * up anything you care about.
 *
 *   npx tsx scripts/cleanup-legacy.ts
 *
 * It drops:
 *   user, session, account, verification, bookmarks, jwks
 * and KEEPS the current collections:
 *   users, sessions, accounts, verifications, tuitions, applications, payments
 */

const LEGACY = [
  "user",
  "session",
  "account",
  "verification",
  "bookmarks",
  "jwks",
]

async function main() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB ?? "mentorlagbe"
  if (!uri) {
    console.error("MONGODB_URI is not set in .env")
    process.exit(1)
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 })
  await client.connect()
  const db = client.db(dbName)

  const existing = (await db.listCollections().toArray()).map((c) => c.name)

  const toDrop = LEGACY.filter((n) => existing.includes(n))

  if (toDrop.length === 0) {
    console.log("No legacy collections to drop. Database is already clean.")
    await client.close()
    return
  }

  console.log(`Dropping legacy collections: ${toDrop.join(", ")}`)
  for (const name of toDrop) {
    await db
      .collection(name)
      .drop()
      .catch(() => {})
    console.log(`  ✓ dropped ${name}`)
  }

  const remaining = (await db.listCollections().toArray())
    .map((c) => c.name)
    .filter((n) => !n.startsWith("system."))
    .sort()
  console.log(`\nRemaining collections: ${remaining.join(", ")}`)
  await client.close()
}

main().catch((err) => {
  console.error("Cleanup failed:", err instanceof Error ? err.message : err)
  process.exit(1)
})
