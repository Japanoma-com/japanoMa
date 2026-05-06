#!/usr/bin/env node
// One-shot migration applier. Reads a .sql file and runs it through the
// postgres.js driver using DATABASE_URL from .env.local. Deliberately
// unadorned — not a replacement for Supabase migrations tooling, just a
// pragmatic bypass when the MCP pathway is unavailable.
//
// Usage:  node scripts/apply-migration.mjs supabase/migrations/NNN_name.sql
import { config } from 'dotenv';
config({ path: '.env.local' });
import { readFileSync } from 'node:fs';
import postgres from 'postgres';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/apply-migration.mjs <path-to-sql>');
  process.exit(1);
}

const sqlText = readFileSync(file, 'utf8');
// max: 1 so unsafe() multi-statement SQL can run on a single dedicated
// connection. Default pool mode otherwise throws UNSAFE_TRANSACTION.
const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

try {
  await sql.unsafe(sqlText);
  console.log(`✔ applied ${file}`);
} catch (err) {
  console.error(`✘ failed on ${file}:`, err.message);
  process.exitCode = 1;
} finally {
  await sql.end();
}
