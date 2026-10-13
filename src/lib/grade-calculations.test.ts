import { describe, expect, it } from "vitest";
import {
  calculateGradeAverages,
  roundAverageForDisplay,
  type GradeEntry,
} from "./grade-calculations";

describe("calculateGradeAverages", () => {
  it("excludes missing values and weights the overall average by recorded grades", () => {
    const entries: GradeEntry[] = [
      { subjectId: 1, semester: 1, score: 80 },
      { subjectId: 1, semester: 2, score: 90 },
      { subjectId: 2, semester: 1, score: null },
      { subjectId: 2, semester: 2, score: 70 },
      { subjectId: 3, semester: 2, score: 0 },
    ];

    const result = calculateGradeAverages(entries);

    expect(result.bySubject[1]).toEqual({ average: 85, count: 2 });
    expect(result.bySubject[2]).toEqual({ average: 70, count: 1 });
    expect(result.bySubject[3]).toEqual({ average: 0, count: 1 });
    expect(result.bySemester[1]).toEqual({ average: 80, count: 1 });
    expect(result.bySemester[2]).toEqual({ average: 160 / 3, count: 3 });
    expect(result.overall).toEqual({ average: 60, count: 4 });
  });

  it("returns null averages when no scores are available", () => {
    const result = calculateGradeAverages([
      { subjectId: 8, semester: 3, score: null },
    ]);

    expect(result.bySubject[8]).toEqual({ average: null, count: 0 });
    expect(result.bySemester[3]).toEqual({ average: null, count: 0 });
    expect(result.overall).toEqual({ average: null, count: 0 });
    expect(calculateGradeAverages([]).overall).toEqual({ average: null, count: 0 });
  });

  it("rejects scores and semesters outside the supported range", () => {
    expect(() =>
      calculateGradeAverages([{ subjectId: 1, semester: 1, score: -1 }]),
    ).toThrow(RangeError);
    expect(() =>
      calculateGradeAverages([{ subjectId: 1, semester: 1, score: 100.1 }]),
    ).toThrow(RangeError);
    expect(() =>
      calculateGradeAverages([
        { subjectId: 1, semester: 7 as GradeEntry["semester"], score: 90 },
      ]),
    ).toThrow(RangeError);
  });

  it("rejects duplicate subject-semester entries", () => {
    expect(() =>
      calculateGradeAverages([
        { subjectId: 1, semester: 1, score: 80 },
        { subjectId: 1, semester: 1, score: 90 },
      ]),
    ).toThrow("duplicate subject and semester entry");
  });
});

describe("roundAverageForDisplay", () => {
  it("rounds only when requested for display and preserves empty values", () => {
    expect(roundAverageForDisplay(91.236)).toBe(91.24);
    expect(roundAverageForDisplay(0)).toBe(0);
    expect(roundAverageForDisplay(null)).toBeNull();
  });

  it("rejects invalid display precision", () => {
    expect(() => roundAverageForDisplay(90, -1)).toThrow(RangeError);
    expect(() => roundAverageForDisplay(90, 1.5)).toThrow(RangeError);
  });
});