import { asc } from "drizzle-orm";
import { io } from "next/cache";
import { createSubject, deleteSubject, updateSubject } from "../actions";
import { db } from "@/db";
import { subjectCategories, subjects } from "@/db/schema";

export const instant = false;

const categoryLabels = {
  wajib: "Wajib",
  peminatan: "Peminatan",
  mulok: "Muatan lokal",
} as const;

const statusMessages: Record<string, string> = {
  created: "Mata pelajaran berhasil ditambahkan.",
  updated: "Perubahan berhasil disimpan.",
  deleted: "Mata pelajaran berhasil dihapus.",
  duplicate: "Nama mata pelajaran itu sudah ada.",
  "name-required": "Nama mata pelajaran wajib diisi.",
  "name-too-long": "Nama mata pelajaran maksimal 80 karakter.",
  "invalid-category": "Pilih kategori mata pelajaran yang tersedia.",
  "invalid-id": "Data mata pelajaran tidak valid.",
  "not-found": "Mata pelajaran tidak ditemukan.",
  "save-error": "Perubahan belum tersimpan. Coba lagi.",
};

type SubjectsPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default function SubjectsPage({ searchParams }: SubjectsPageProps) {
  return (
    <main className="page-content">
        <SubjectManager searchParams={searchParams} />
    </main>
  );
}

async function SubjectManager({ searchParams }: SubjectsPageProps) {
  await io();
  const [{ status }, subjectRows] = await Promise.all([
    searchParams,
    Promise.resolve(db.select().from(subjects).orderBy(asc(subjects.name)).all()),
  ]);
  const categoryCounts = Object.fromEntries(
    subjectCategories.map((category) => [
      category,
      subjectRows.filter((subject) => subject.category === category).length,
    ]),
  ) as Record<(typeof subjectCategories)[number], number>;

  return (
    <>
      <section className="page-intro" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">PENGELOLAAN DATA · SEMESTER 1–6</p>
          <h1 id="page-title">Mata pelajaran</h1>
          <p className="intro-copy">
            Susun daftar mapel dan kategorinya untuk catatan rapormu.
          </p>
        </div>
        <div className="total-count" aria-label={`${subjectRows.length} mata pelajaran`}>
          <strong>{subjectRows.length.toString().padStart(2, "0")}</strong>
          <span>MAPEL<br />TERDAFTAR</span>
        </div>
      </section>

      <div className="content-grid">
        <section className="directory" aria-labelledby="directory-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DAFTAR</p>
              <h2 id="directory-title">Semua mata pelajaran</h2>
            </div>
            <span className="list-count">{subjectRows.length} mapel</span>
          </div>

          {status && statusMessages[status] && (
            <p
              className={`notice ${["created", "updated", "deleted"].includes(status) ? "notice-success" : "notice-error"}`}
              role="status"
            >
              {statusMessages[status]}
            </p>
          )}

          <form action={createSubject} className="add-form">
            <label className="field name-field">
              <span>Nama mata pelajaran</span>
              <input
                autoComplete="off"
                maxLength={80}
                name="name"
                placeholder="Contoh: Matematika"
                required
              />
            </label>
            <label className="field category-field">
              <span>Kategori</span>
              <select defaultValue="wajib" name="category">
                {subjectCategories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>
            <button className="button button-primary add-button" type="submit">
              <span aria-hidden="true">+</span>
              Tambah mapel
            </button>
          </form>

          {subjectRows.length === 0 ? (
            <div className="empty-state">
              <span className="empty-mark" aria-hidden="true">01</span>
              <h3>Daftarmu masih kosong</h3>
              <p>Tambahkan mata pelajaran pertama untuk memulai.</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="subject-table">
                <thead>
                  <tr>
                    <th scope="col">Mata pelajaran</th>
                    <th scope="col">Kategori</th>
                    <th scope="col"><span className="visually-hidden">Aksi</span></th>
                  </tr>
                </thead>
                <tbody>
                  {subjectRows.map((subject) => (
                    <tr key={subject.id}>
                      <th className="subject-name" data-label="Mapel" scope="row">
                        {subject.name}
                      </th>
                      <td className="subject-category" data-label="Kategori">
                        <span className={`category-label category-${subject.category}`}>
                          <span aria-hidden="true" />
                          {categoryLabels[subject.category]}
                        </span>
                      </td>
                      <td className="row-actions" data-label="Aksi">
                        <details className="action-disclosure edit-disclosure">
                          <summary className="button button-quiet">Edit</summary>
                          <form action={updateSubject} className="edit-form">
                            <input name="id" type="hidden" value={subject.id} />
                            <label className="field">
                              <span>Nama mata pelajaran</span>
                              <input
                                defaultValue={subject.name}
                                maxLength={80}
                                name="name"
                                required
                              />
                            </label>
                            <label className="field">
                              <span>Kategori</span>
                              <select defaultValue={subject.category} name="category">
                                {subjectCategories.map((category) => (
                                  <option key={category} value={category}>
                                    {categoryLabels[category]}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <button className="button button-primary" type="submit">
                              Simpan perubahan
                            </button>
                          </form>
                        </details>
                        <details className="action-disclosure delete-disclosure">
                          <summary className="button button-danger-quiet">Hapus</summary>
                          <div className="delete-confirmation">
                            <p>Hapus {subject.name}? Nilai terkait juga akan terhapus.</p>
                            <form action={deleteSubject}>
                              <input name="id" type="hidden" value={subject.id} />
                              <button className="button button-danger" type="submit">
                                Ya, hapus mapel
                              </button>
                            </form>
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="category-summary" aria-labelledby="category-title">
          <p className="eyebrow">RINGKASAN</p>
          <h2 id="category-title">Kategori mapel</h2>
          <ul>
            {subjectCategories.map((category) => (
              <li className={`summary-row summary-${category}`} key={category}>
                <span className="summary-indicator" aria-hidden="true" />
                <span>{categoryLabels[category]}</span>
                <strong>{categoryCounts[category]}</strong>
              </li>
            ))}
          </ul>
          <p className="summary-footnote">
            Daftar ini disimpan di perangkat ini.
          </p>
        </aside>
      </div>
    </>
  );
}