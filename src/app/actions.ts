"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { grades, subjectCategories, subjects } from "@/db/schema";

function getSubjectName(formData: FormData) {
  const value = formData.get("name");
  return typeof value === "string" ? value.trim() : "";
}

function getSubjectCategory(formData: FormData) {
  const value = formData.get("category");
  return typeof value === "string" && subjectCategories.includes(value as (typeof subjectCategories)[number])
    ? (value as (typeof subjectCategories)[number])
    : null;
}

function getSubjectId(formData: FormData) {
  const value = formData.get("id");
  if (typeof value !== "string" || !/^\d+$/.test(value)) return null;

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function hasDuplicateName(name: string, excludingId?: number) {
  const normalizedName = sql`lower(${subjects.name}) = lower(${name})`;
  const conditions = excludingId
    ? and(normalizedName, ne(subjects.id, excludingId))
    : normalizedName;

  return Boolean(
    db.select({ id: subjects.id }).from(subjects).where(conditions).get(),
  );
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}

function finishMutation(status: string): never {
  revalidatePath("/");
  revalidatePath("/subjects");
  redirect(`/subjects?status=${status}`);
}

function finishGradeMutation(status: string, semester: number): never {
  revalidatePath("/");
  revalidatePath("/grades");
  revalidatePath("/analysis");
  redirect(`/grades?semester=${semester}&status=${status}`);
}

export async function saveGrades(formData: FormData) {
  const semesterValue = formData.get("semester");
  const semester =
    typeof semesterValue === "string" && /^\d+$/.test(semesterValue)
      ? Number(semesterValue)
      : Number.NaN;

  if (!Number.isInteger(semester) || semester < 1 || semester > 6) {
    finishGradeMutation("invalid-semester", 1);
  }

  const subjectRows = db.select({ id: subjects.id }).from(subjects).all();
  if (subjectRows.length === 0) finishGradeMutation("no-subjects", semester);

  const entries = subjectRows.map((subject) => {
    const value = formData.get(`score-${subject.id}`);
    if (typeof value !== "string") {
      finishGradeMutation("invalid-form", semester);
    }

    const normalizedValue = value.trim();
    if (normalizedValue === "") return { subjectId: subject.id, score: null };

    const score = Number(normalizedValue);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      finishGradeMutation("invalid-score", semester);
    }

    return { subjectId: subject.id, score };
  });

  const existingRows = db
    .select({ subjectId: grades.subjectId })
    .from(grades)
    .where(eq(grades.semester, semester))
    .all();
  const existingSubjectIds = new Set(existingRows.map((grade) => grade.subjectId));

  db.transaction((transaction) => {
    for (const entry of entries) {
      if (entry.score === null && !existingSubjectIds.has(entry.subjectId)) continue;

      transaction
        .insert(grades)
        .values({ ...entry, semester })
        .onConflictDoUpdate({
          target: [grades.subjectId, grades.semester],
          set: { score: entry.score },
        })
        .run();
    }
  });

  finishGradeMutation("saved", semester);
}

export async function createSubject(formData: FormData) {
  const name = getSubjectName(formData);
  const category = getSubjectCategory(formData);

  if (!name) finishMutation("name-required");
  if (name.length > 80) finishMutation("name-too-long");
  if (!category) finishMutation("invalid-category");
  if (hasDuplicateName(name)) finishMutation("duplicate");

  try {
    db.insert(subjects).values({ name, category }).run();
  } catch (error) {
    finishMutation(isUniqueConstraintError(error) ? "duplicate" : "save-error");
  }

  finishMutation("created");
}

export async function updateSubject(formData: FormData) {
  const id = getSubjectId(formData);
  const name = getSubjectName(formData);
  const category = getSubjectCategory(formData);

  if (!id) finishMutation("invalid-id");
  if (!name) finishMutation("name-required");
  if (name.length > 80) finishMutation("name-too-long");
  if (!category) finishMutation("invalid-category");

  const existing = db.select({ id: subjects.id }).from(subjects).where(eq(subjects.id, id)).get();
  if (!existing) finishMutation("not-found");
  if (hasDuplicateName(name, id)) finishMutation("duplicate");

  try {
    db.update(subjects).set({ name, category }).where(eq(subjects.id, id)).run();
  } catch (error) {
    finishMutation(isUniqueConstraintError(error) ? "duplicate" : "save-error");
  }

  finishMutation("updated");
}

export async function deleteSubject(formData: FormData) {
  const id = getSubjectId(formData);
  if (!id) finishMutation("invalid-id");

  const result = db.delete(subjects).where(eq(subjects.id, id)).run();
  finishMutation(result.changes > 0 ? "deleted" : "not-found");
}