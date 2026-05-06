/**
 * Drizzle database client for Japanoma
 *
 * Uses the `postgres` driver with drizzle-orm.
 * Requires DATABASE_URL environment variable.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

function createDb() {
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Add it to .env.local (see .env.example)."
    );
  }

  // `max: 5` lets a single serverless invocation run up to 5 queries in
  // parallel (dashboard pages fire 6–8). Below that, Promise.all serializes
  // at the transport layer and pages feel slow.
  // Safe for Supabase — PgBouncer/pooler sits between us and Postgres so
  // true connection count to the DB is controlled there.
  const client = postgres(connectionString, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });

  return drizzle(client, { schema });
}

/**
 * Drizzle ORM instance — lazily initialized so pages that don't
 * query the database can build and render without DATABASE_URL.
 */
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(target, prop, receiver) {
    if (!("_instance" in target)) {
      Object.defineProperty(target, "_instance", { value: createDb() });
    }
    return Reflect.get(
      (target as unknown as Record<string, unknown>)._instance as object,
      prop,
      receiver
    );
  },
});
