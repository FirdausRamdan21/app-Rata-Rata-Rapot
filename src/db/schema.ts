import { sql } from "drizzle-orm";
import {
  check,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const subjectCategories = ["wajib", "peminatan", "mulok"] as const;

export const subjects = sqliteTable(
  "subjects",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull().unique(),
    category: text("category", { enum: subjectCategories }).notNull(),
  },
  (table) => [
    check(
      "subjects_category_check",
      sql`${table.category} in ('wajib', 'peminatan', 'mulok')`,
    ),
  ],
);

export const grades = sqliteTable(
  "grades",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    semester: integer("semester").notNull(),
    score: real("score"),
  },
  (table) => [
    uniqueIndex("grades_subject_semester_unique").on(
      table.subjectId,
      table.semester,
    ),
    check(
      "grades_semester_range_check",
      sql`${table.semester} between 1 and 6`,
    ),
    check(
      "grades_score_range_check",
      sql`${table.score} is null or (${table.score} >= 0 and ${table.score} <= 100)`,
    ),
  ],
);