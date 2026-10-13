import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import * as schema from "./schema";

const databasePath = join(process.cwd(), "data", "grades.db");
mkdirSync(dirname(databasePath), { recursive: true });

type SQLiteClient = InstanceType<typeof Database>;
const globalForDatabase = globalThis as typeof globalThis & {
  sqliteClient?: SQLiteClient;
};

const sqlite = globalForDatabase.sqliteClient ?? new Database(databasePath);
sqlite.pragma("foreign_keys = ON");

if (process.env.NODE_ENV !== "production") {
  globalForDatabase.sqliteClient = sqlite;
}

export const db = drizzle(sqlite, { schema });