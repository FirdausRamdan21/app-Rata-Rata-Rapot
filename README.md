# Nilai Rapor

> Catat nilai dengan rapi. Pahami perkembanganmu. Susun langkah menuju kampus tujuan.

Nilai Rapor adalah aplikasi web personal untuk mengelola mata pelajaran dan nilai rapor SMA/SMK selama enam semester. Data disimpan di SQLite lokal, sementara ringkasan nilai dihitung otomatis dari nilai yang sudah diisi.

## Alur aplikasi

| Halaman | Kegunaan |
| --- | --- |
| **Dashboard** | Melihat jumlah mapel, nilai terisi, rata-rata keseluruhan, dan langkah berikutnya. |
| **Mata Pelajaran** | Menambah, mengubah, dan menghapus mapel beserta kategorinya. |
| **Input Nilai** | Memilih semester 1–6 dan menyimpan nilai setiap mapel. |
| **Analisis** | Membandingkan rata-rata per mapel, per semester, dan keseluruhan. |

Kategori mapel yang tersedia: wajib, peminatan, dan muatan lokal. Nilai yang diperbolehkan berada pada rentang 0–100.

## Aturan perhitungan

- Nilai kosong tidak dihitung sebagai 0. Nilai `0` tetap dihitung jika memang tercantum di rapor.
- Rata-rata per mapel memakai nilai mapel tersebut yang sudah diisi.
- Rata-rata per semester memakai nilai terisi pada semester tersebut.
- Rata-rata keseluruhan menggabungkan semua nilai terisi, bukan merata-ratakan rata-rata semester.
- Nilai disimpan dengan presisi penuh. Pembulatan dua desimal hanya digunakan saat ditampilkan.

## Menjalankan secara lokal

**Prasyarat:** Node.js 22 atau lebih baru dan npm.

```bash
npm install
npm run db:migrate
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000). Aplikasi berjalan sebagai layanan lokal; tutup tab kapan saja, lalu jalankan kembali `npm run dev` untuk melanjutkan.

### Database

File SQLite berada di `data/grades.db`. File ini tidak dilacak Git agar data rapor pribadi tidak ikut tersimpan bersama kode.

Jika skema database berubah, buat migrasi baru lalu terapkan:

```bash
npm run db:generate
npm run db:migrate
```

## Pemeriksaan

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Unit test perhitungan berada di `src/lib/grade-calculations.test.ts`.

## Teknologi

Next.js App Router · React · TypeScript · Tailwind CSS · SQLite · Drizzle ORM · Vitest

## Struktur proyek

```text
src/
  app/
    analysis/       Ringkasan nilai
    grades/         Input nilai semester
    subjects/       Pengelolaan mata pelajaran
    actions.ts      Server Actions untuk perubahan data
    app-nav.tsx     Navigasi utama
    page.tsx        Dashboard
  db/
    index.ts        Koneksi SQLite
    schema.ts       Skema Drizzle
  lib/
    grade-calculations.ts       Fungsi perhitungan
    grade-calculations.test.ts  Unit test
drizzle/            Riwayat migrasi database
data/               Database SQLite lokal, diabaikan Git
```

## Privasi dan batas penggunaan

Aplikasi ini dirancang untuk satu pengguna pada satu instalasi lokal. Belum ada akun, sinkronisasi cloud, atau pemisahan data antar pengguna. Jangan membuka instalasi ini sebagai layanan publik bersama sebelum autentikasi dan perlindungan data multi-pengguna ditambahkan.

Simpan salinan cadangan `data/grades.db` di lokasi privat. Jangan mengunggah database berisi nilai pribadi ke repository publik.