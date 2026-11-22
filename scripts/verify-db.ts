import "dotenv/config"
import { MongoClient } from "mongodb"

/**
 * Connection + collection verifier.
 *
 * Prints NO secrets — only the database name, collection names and document
 * counts. Use it to confirm the MongoDB URI in .env works and that the four
 * required domain collections exist.
 *
 *   npx tsx scripts/verify-db.ts
 */

const REQUIRED = ["users", "tuitions", "applications", "payments"]

async function main() {
  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB ?? "mentorlagbe"

  if (!uri) {
    console.error("MONGODB_URI is not set in .env")
    process.exit(1)
  }

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 })

  try {
    await client.connect()
  } catch (err) {
    console.error(
      "Connection failed:",
      err instanceof Error ? err.message : String(err)
    )
    process.exit(1)
  }

  const db = client.db(dbName)
  const cols = await db.listCollections().toArray()
  const names = cols
    .map((c) => c.name)
    .filter((n) => !n.startsWith("system."))
    .sort()

  if (names.length === 0) {
    console.log(`Connected to "${dbName}" but no collections exist yet.`)
    console.log("Run: npm run seed")
    await client.close()
    return
  }

  console.log(`Connected to database "${dbName}". Collections:`)
  for (const name of names) {
    const count = await db.collection(name).countDocuments()
    console.log(`  - ${name}: ${count} document(s)`)
  }

  const missing = REQUIRED.filter((r) => !names.includes(r))
  const extra = names.filter((n) => !REQUIRED.includes(n))

  if (missing.length) {
    console.error(`\nFAIL: missing required collections: ${missing.join(", ")}`)
    await client.close()
    process.exit(1)
  }

  console.log(
    "\nPASS: all four required collections exist (users, tuitions, applications, payments)."
  )

  if (extra.length) {
    console.log(
      `Note: better-auth also creates auth-infra collections: ${extra.join(", ")}`
    )
  }

  await client.close()
  process.exit(0)
}

main().catch((err) => {
  console.error("Unexpected error:", err instanceof Error ? err.message : err)
  process.exit(1)
})
