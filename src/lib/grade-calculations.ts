export type Semester = 1 | 2 | 3 | 4 | 5 | 6;

export type GradeEntry = {
  subjectId: number;
  semester: Semester;
  score: number | null;
};

export type AverageSummary = {
  average: number | null;
  count: number;
};

export type GradeAverages = {
  bySubject: Record<number, AverageSummary>;
  bySemester: Partial<Record<Semester, AverageSummary>>;
  overall: AverageSummary;
};

type RunningTotal = {
  sum: number;
  count: number;
};

function createSummary(total: RunningTotal): AverageSummary {
  return {
    average: total.count === 0 ? null : total.sum / total.count,
    count: total.count,
  };
}

export function calculateGradeAverages(entries: readonly GradeEntry[]): GradeAverages {
  const bySubject = new Map<number, RunningTotal>();
  const bySemester = new Map<Semester, RunningTotal>();
  const seenSubjectSemesters = new Set<string>();
  const overallTotal: RunningTotal = { sum: 0, count: 0 };

  for (const entry of entries) {
    if (!Number.isSafeInteger(entry.subjectId) || entry.subjectId <= 0) {
      throw new RangeError("subjectId must be a positive safe integer");
    }

    if (!Number.isInteger(entry.semester) || entry.semester < 1 || entry.semester > 6) {
      throw new RangeError("semester must be between 1 and 6");
    }

    if (
      entry.score !== null &&
      (!Number.isFinite(entry.score) || entry.score < 0 || entry.score > 100)
    ) {
      throw new RangeError("score must be null or between 0 and 100");
    }

    const subjectSemesterKey = `${entry.subjectId}:${entry.semester}`;
    if (seenSubjectSemesters.has(subjectSemesterKey)) {
      throw new RangeError("duplicate subject and semester entry");
    }
    seenSubjectSemesters.add(subjectSemesterKey);

    const subjectTotal = bySubject.get(entry.subjectId) ?? { sum: 0, count: 0 };
    const semester = entry.semester as Semester;
    const semesterTotal = bySemester.get(semester) ?? { sum: 0, count: 0 };
    bySubject.set(entry.subjectId, subjectTotal);
    bySemester.set(semester, semesterTotal);

    if (entry.score === null) continue;

    subjectTotal.sum += entry.score;
    subjectTotal.count += 1;
    semesterTotal.sum += entry.score;
    semesterTotal.count += 1;
    overallTotal.sum += entry.score;
    overallTotal.count += 1;
  }

  return {
    bySubject: Object.fromEntries(
      Array.from(bySubject, ([subjectId, total]) => [subjectId, createSummary(total)]),
    ),
    bySemester: Object.fromEntries(
      Array.from(bySemester, ([semester, total]) => [semester, createSummary(total)]),
    ),
    overall: createSummary(overallTotal),
  };
}

export function roundAverageForDisplay(value: number | null, decimals = 2): number | null {
  if (value === null) return null;
  if (!Number.isFinite(value)) {
    throw new RangeError("average must be a finite number or null");
  }
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 10) {
    throw new RangeError("decimals must be an integer between 0 and 10");
  }

  const rounded = Number(value.toFixed(decimals));
  return Object.is(rounded, -0) ? 0 : rounded;
}