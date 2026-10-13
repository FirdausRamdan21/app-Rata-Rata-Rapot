import { eq } from "drizzle-orm";
import Link from "next/link";
import { io } from "next/cache";
import { saveGrades } from "../actions";
import { db } from "@/db";
import { grades, subjects } from "@/db/schema";

export const instant = false;

const semesters = [1, 2, 3, 4, 5, 6] as const;

const categoryLabels = {
  wajib: "Wajib",
  peminatan: "Peminatan",
  mulok: "Muatan lokal",
} as const;

const statusMessages: Record<string, string> = {
  saved: "Nilai semester berhasil disimpan.",
  "invalid-semester": "Pilih semester antara 1 dan 6.",
  "invalid-score": "Nilai harus berupa angka dari 0 sampai 100.",
  "invalid-form": "Data form tidak lengkap. Muat ulang halaman lalu coba lagi.",
  "no-subjects": "Tambahkan mata pelajaran sebelum mengisi nilai.",
};

type GradesPageProps = {
  searchParams: Promise<{
    semester?: string | string[];
    status?: string;
  }>;
};

function getSemester(value: string | string[] | undefined) {
  const semesterValue = Array.isArray(value) ? value[0] : value;
  const semester = Number(semesterValue ?? 1);
  return Number.isInteger(semester) && semester >= 1 && semester <= 6 ? semester : 1;
}

export default async function GradesPage({ searchParams }: GradesPageProps) {
  await io();
  const params = await searchParams;
  const semester = getSemester(params.semester);
  const [subjectRows, gradeRows] = await Promise.all([
    Promise.resolve(
      db
        .select({
          id: subjects.id,
          name: subjects.name,
          category: subjects.category,
        })
        .from(subjects)
        .orderBy(subjects.name)
        .all(),
    ),
    Promise.resolve(
      db
        .select({ subjectId: grades.subjectId, score: grades.score })
        .from(grades)
        .where(eq(grades.semester, semester))
        .all(),
    ),
  ]);
  const scoreBySubject = new Map(gradeRows.map((grade) => [grade.subjectId, grade.score]));
  const filledCount = gradeRows.filter((grade) => grade.score !== null).length;
  const statusMessage = params.status ? statusMessages[params.status] : undefined;

  return (
    <main className="page-content feature-page grades-page">
      <section className="page-intro" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">LANGKAH 02 · CATAT NILAI</p>
          <h1 id="page-title">Input nilai</h1>
          <p className="intro-copy">
            Pilih semester, lalu isi nilai sesuai yang tertulis di rapor.
          </p>
        </div>
        <div className="total-count" aria-label={`${filledCount} nilai terisi`}>
          <strong>{filledCount.toString().padStart(2, "0")}</strong>
          <span>NILAI<br />TERISI</span>
        </div>
      </section>

      <nav className="semester-nav" aria-label="Pilih semester">
        {semesters.map((item) => (
          <Link
            aria-current={item === semester ? "page" : undefined}
            className={`semester-link${item === semester ? " semester-link-active" : ""}`}
            href={`/grades?semester=${item}`}
            key={item}
          >
            Semester {item}
          </Link>
        ))}
      </nav>

      {statusMessage && (
        <p
          className={`notice ${params.status === "saved" ? "notice-success" : "notice-error"}`}
          role="status"
        >
          {statusMessage}
        </p>
      )}

      {subjectRows.length === 0 ? (
        <div className="empty-state grade-empty-state">
          <span className="empty-mark" aria-hidden="true">01</span>
          <h2>Belum ada mata pelajaran</h2>
          <p>Tambahkan mapel dahulu, lalu kembali untuk mengisi nilainya.</p>
          <Link className="button button-primary" href="/subjects">
            Kelola mata pelajaran <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <form action={saveGrades} className="grade-form">
          <input name="semester" type="hidden" value={semester} />
          <div className="grade-form-heading">
            <div>
              <p className="eyebrow">SEMESTER {semester}</p>
              <h2>Nilai mata pelajaran</h2>
            </div>
            <span>{filledCount} dari {subjectRows.length} nilai terisi</span>
          </div>

          <div className="table-wrap grade-table-wrap">
            <table className="grade-table">
              <thead>
                <tr>
                  <th scope="col">Mata pelajaran</th>
                  <th scope="col">Kategori</th>
                  <th scope="col">Nilai <span>(0–100)</span></th>
                </tr>
              </thead>
              <tbody>
                {subjectRows.map((subject) => {
                  const score = scoreBySubject.get(subject.id) ?? null;
                  return (
                    <tr key={subject.id}>
                      <th scope="row">{subject.name}</th>
                      <td>
                        <span className={`category-label category-${subject.category}`}>
                          <span aria-hidden="true" />
                          {categoryLabels[subject.category]}
                        </span>
                      </td>
                      <td>
                        <label className="grade-input-wrap">
                          <span className="visually-hidden">
                            Nilai {subject.name}, semester {semester}
                          </span>
                          <input
                            autoComplete="off"
                            defaultValue={score ?? ""}
                            inputMode="decimal"
                            max="100"
                            min="0"
                            name={`score-${subject.id}`}
                            placeholder="—"
                            step="0.01"
                            type="number"
                          />
                          <span aria-hidden="true">/ 100</span>
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grade-form-footer">
            <p>Biarkan kosong jika nilai belum ada. Nilai kosong tidak dihitung sebagai 0.</p>
            <button className="button button-primary save-grade-button" type="submit">
              Simpan nilai semester {semester}
            </button>
          </div>
        </form>
      )}

      <aside className="tip-strip grade-tip">
        <span className="tip-icon" aria-hidden="true">i</span>
        <p>
          Nilai 0 tetap dihitung bila memang tercantum di rapor. Mengosongkan nilai
          yang sudah tersimpan akan mengeluarkannya dari rata-rata.
        </p>
      </aside>
    </main>
  );
}