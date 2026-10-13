import { io } from "next/cache";
import Link from "next/link";
import { db } from "@/db";
import { grades, subjects } from "@/db/schema";
import {
  calculateGradeAverages,
  roundAverageForDisplay,
  type Semester,
} from "@/lib/grade-calculations";

export const instant = false;

export default function Home() {
  return (
    <main className="page-content dashboard-page">
      <section className="dashboard-intro" aria-labelledby="dashboard-title">
        <div>
          <p className="eyebrow">RUANG BELAJAR PRIBADI</p>
          <h1 id="dashboard-title">Rapormu, lebih terarah.</h1>
          <p className="intro-copy">
            Catat nilai per semester, lihat perkembangan, dan susun target kuliahmu.
          </p>
        </div>
        <span className="dashboard-period">SEMESTER 1 — 6</span>
      </section>

        <DashboardOverview />

      <section className="workflow-section" aria-labelledby="workflow-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">MULAI DI SINI</p>
            <h2 id="workflow-title">Tiga langkah merapikan rapor</h2>
          </div>
        </div>
        <ol className="workflow-list">
          <li>
            <span className="workflow-number">01</span>
            <div>
              <h3>Atur mata pelajaran</h3>
              <p>Tambahkan mapel dan pilih kategorinya sesuai rapor sekolah.</p>
            </div>
            <Link className="text-link" href="/subjects">Kelola mapel <span aria-hidden="true">→</span></Link>
          </li>
          <li>
            <span className="workflow-number">02</span>
            <div>
              <h3>Masukkan nilai semester</h3>
              <p>Isi nilai 0–100 untuk mapel yang muncul pada semester tersebut.</p>
            </div>
            <Link className="text-link" href="/grades">Buka input nilai <span aria-hidden="true">→</span></Link>
          </li>
          <li>
            <span className="workflow-number">03</span>
            <div>
              <h3>Pahami ringkasannya</h3>
              <p>Bandingkan rata-rata mapel dan semester dari nilai yang tercatat.</p>
            </div>
            <Link className="text-link" href="/analysis">Lihat analisis <span aria-hidden="true">→</span></Link>
          </li>
        </ol>
      </section>

      <aside className="tip-strip">
        <span className="tip-icon" aria-hidden="true">i</span>
        <p>
          Nilai yang belum diisi tidak dianggap 0. Hanya nilai yang tercatat yang
          masuk ke perhitungan rata-rata.
        </p>
      </aside>
    </main>
  );
}

async function DashboardOverview() {
  await io();
  const [subjectRows, gradeRows] = await Promise.all([
    Promise.resolve(db.select({ id: subjects.id }).from(subjects).all()),
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
  const average = roundAverageForDisplay(averages.overall.average);
  const nextHref = subjectRows.length === 0 ? "/subjects" : "/grades";
  const nextLabel = subjectRows.length === 0 ? "Mulai atur mata pelajaran" : "Lanjut ke input nilai";

  return (
    <>
      <section className="dashboard-metrics" aria-label="Ringkasan rapor">
        <div className="metric-item">
          <span className="metric-label">Mata pelajaran</span>
          <strong>{subjectRows.length}</strong>
          <span className="metric-note">terdaftar</span>
        </div>
        <div className="metric-item">
          <span className="metric-label">Nilai tercatat</span>
          <strong>{averages.overall.count}</strong>
          <span className="metric-note">nilai terisi</span>
        </div>
        <div className="metric-item metric-average">
          <span className="metric-label">Rata-rata keseluruhan</span>
          <strong>
            {average === null
              ? "—"
              : average.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
          <span className="metric-note">
            {average === null ? "belum ada nilai" : "dari nilai yang tercatat"}
          </span>
        </div>
        <Link className="metric-next" href={nextHref}>
          <span className="metric-next-label">LANGKAH BERIKUTNYA</span>
          <span>{nextLabel} <span aria-hidden="true">→</span></span>
        </Link>
      </section>
    </>
  );
}
