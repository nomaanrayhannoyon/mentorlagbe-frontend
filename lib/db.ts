import { Db, MongoClient } from "mongodb"

/**
 * Single shared MongoDB client for the whole app.
 *
 * Both better-auth (lib/auth.ts) and the domain collections
 * (lib/collections.ts) import `getDb` / `getMongoClient` from here so
 * there is exactly one connection pool per server instance.
 */

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error(
    "MONGODB_URI is not set. Add your MongoDB connection string to .env."
  )
}

const DB_NAME = process.env.MONGODB_DB ?? "mentorlagbe"

// Cache the client + db across hot reloads in development.
type MongoCache = {
  client: MongoClient
  dbPromise: Promise<Db>
}

const globalForMongo = globalThis as unknown as {
  __mongoCache?: MongoCache
}

function createClient(): MongoClient {
  return new MongoClient(uri as string, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  })
}

function getCache(): MongoCache {
  if (globalForMongo.__mongoCache) return globalForMongo.__mongoCache

  const client = createClient()
  const dbPromise = (async () => {
    await client.connect()
    const db = client.db(DB_NAME)
    await ensureIndexes(db)
    return db
  })()

  const cache: MongoCache = { client, dbPromise }
  globalForMongo.__mongoCache = cache
  return cache
}

/** Shared MongoClient (connected lazily). */
export function getMongoClient(): MongoClient {
  return getCache().client
}

/** Shared Db handle. Resolves after connect + index creation. */
export function getDb(): Promise<Db> {
  return getCache().dbPromise
}

/**
 * Create the indexes the domain collections rely on. Idempotent — Mongo
 * ignores `createIndex` when an identical index already exists.
 *
 * better-auth is configured with `usePlural: true`, so it owns `users`,
 * `sessions`, `accounts` and `verifications`. We only add the unique email
 * index on `users` here as a safety net.
 */
async function ensureIndexes(db: Db): Promise<void> {
  await Promise.allSettled([
    // Stale indexes from earlier schema versions (status/level/price naming,
    // legacy payment fields). dropIndex fails harmlessly when absent.
    db.collection("tuitions").dropIndex("status_1_subject_1_mode_1_level_1"),
    db.collection("tuitions").dropIndex("status_1_price_1_createdAt_-1"),
    db.collection("tuitions").dropIndex("status_1_subject_1"),
    db.collection("payments").dropIndex("tuitionId_1"),
    db.collection("payments").dropIndex("studentId_1"),
    // A unique index on transactionId breaks checkout: pending records have no
    // transactionId yet and Mongo indexes them all as null (one allowed).
    db.collection("payments").dropIndex("transactionId_1"),
  ])
  await Promise.allSettled([
    db.collection("users").createIndex({ email: 1 }, { unique: true }),
    db.collection("tuitions").createIndex({ tutorId: 1 }),
    db.collection("tuitions").createIndex({
      approvalStatus: 1,
      subject: 1,
      mode: 1,
      classLevel: 1,
    }),
    db.collection("tuitions").createIndex({
      title: "text",
      description: "text",
      subject: "text",
    }),
    db
      .collection("tuitions")
      .createIndex({ approvalStatus: 1, monthlyFee: 1, createdAt: -1 }),
    db.collection("applications").createIndex({ tuitionId: 1 }),
    db.collection("applications").createIndex({ studentId: 1 }),
    db
      .collection("applications")
      .createIndex({ tuitionId: 1, studentId: 1 }, { unique: true }),
    db.collection("payments").createIndex({ userId: 1 }),
    db.collection("payments").createIndex({ stripeSessionId: 1 }),
    db.collection("payments").createIndex({ paymentStatus: 1 }),
    db.collection("payments").createIndex({ transactionId: 1 }),
  ])
}
