import Link from "next/link";
import { io } from "next/cache";
import { db } from "@/db";
import { grades, subjects } from "@/db/schema";
import {
  calculateGradeAverages,
  roundAverageForDisplay,
  type Semester,
} from "@/lib/grade-calculations";

const semesters = [1, 2, 3, 4, 5, 6] as const;

export const instant = false;

function formatAverage(value: number | null) {
  const rounded = roundAverageForDisplay(value);
  return rounded === null
    ? "—"
    : rounded.toLocaleString("id-ID", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
}

export default function AnalysisPage() {
  return (
    <main className="page-content feature-page">
      <section className="page-intro" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">LANGKAH 03 · PAHAMI PERKEMBANGAN</p>
          <h1 id="page-title">Analisis nilai</h1>
          <p className="intro-copy">
            Ringkasan dihitung dari nilai yang sudah tercatat, bukan dari data yang kosong.
          </p>
        </div>
      </section>

        <AnalysisSummary />
    </main>
  );
}

async function AnalysisSummary() {
  await io();
  const [subjectsList, gradeRows] = await Promise.all([
    Promise.resolve(
      db.select({ id: subjects.id, name: subjects.name }).from(subjects).orderBy(subjects.name).all(),
    ),
    Promise.resolve(
      db
        .select({
          subjectId: grades.subjectId,
          semester: grades.semester,
          score: grades.score,
        })
        .from(grades)
        .all(),
    ),
  ]);
  const averages = calculateGradeAverages(
    gradeRows.map((grade) => ({ ...grade, semester: grade.semester as Semester })),
  );
  const bySubject = subjectsList.map((subject) => ({
    ...subject,
    summary: averages.bySubject[subject.id] ?? { average: null, count: 0 },
  }));

  return (
    <>
      <section className="analysis-total" aria-label="Ringkasan keseluruhan">
        <div>
          <p className="eyebrow">RATA-RATA KESELURUHAN</p>
          <strong className="analysis-average">{formatAverage(averages.overall.average)}</strong>
          <span className="analysis-caption">
            {averages.overall.count} nilai terisi dari seluruh semester
          </span>
        </div>
        <p className="analysis-hint">
          Rata-rata keseluruhan menggabungkan semua nilai yang tersedia. Semester
          dengan jumlah mapel berbeda tidak diberi bobot tambahan.
        </p>
      </section>

      {averages.overall.count === 0 && (
        <div className="empty-analysis" role="status">
          <span className="empty-mark" aria-hidden="true">—</span>
          <div>
            <h2>Belum ada nilai untuk dianalisis</h2>
            <p>Nilai rata-rata akan muncul setelah nilai semester dicatat.</p>
          </div>
          <Link className="text-link" href="/grades">Ke input nilai <span aria-hidden="true">→</span></Link>
        </div>
      )}

      <div className="analysis-grid">
        <section className="analysis-section" aria-labelledby="semester-analysis-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PERIODE</p>
              <h2 id="semester-analysis-title">Rata-rata per semester</h2>
            </div>
          </div>
          <div className="table-wrap">
            <table className="analysis-table">
              <thead>
                <tr><th scope="col">Semester</th><th scope="col">Nilai terisi</th><th scope="col">Rata-rata</th></tr>
              </thead>
              <tbody>
                {semesters.map((semester) => {
                  const summary = averages.bySemester[semester];
                  return (
                    <tr key={semester}>
                      <th scope="row">Semester {semester}</th>
                      <td>{summary?.count ?? 0}</td>
                      <td>{formatAverage(summary?.average ?? null)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="analysis-section" aria-labelledby="subject-analysis-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PER MATA PELAJARAN</p>
              <h2 id="subject-analysis-title">Rata-rata mapel</h2>
            </div>
          </div>
          {bySubject.length === 0 ? (
            <div className="analysis-empty-list">
              <p>Tambahkan mapel dahulu agar ringkasannya tampil di sini.</p>
              <Link className="text-link" href="/subjects">Kelola mapel <span aria-hidden="true">→</span></Link>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="analysis-table">
                <thead>
                  <tr><th scope="col">Mata pelajaran</th><th scope="col">Nilai terisi</th><th scope="col">Rata-rata</th></tr>
                </thead>
                <tbody>
                  {bySubject.map((subject) => (
                    <tr key={subject.id}>
                      <th scope="row">{subject.name}</th>
                      <td>{subject.summary.count}</td>
                      <td>{formatAverage(subject.summary.average)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}