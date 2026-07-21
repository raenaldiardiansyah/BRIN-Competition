# Master Execution Guardrail

Dokumen ini merupakan penjabaran dari **AI Execution Governance** pada Implementation Plan v3. Agen AI wajib mematuhi seluruh aturan di bawah ini sebelum, selama, dan setelah mengeksekusi *Component Prompt*.

## 1. Dokumen Wajib
Sebelum memulai eksekusi apa pun, agen wajib membaca:
1. `AGENTS.md`
2. `docs/implementation/subscription-ai-homepage-plan-v3.md` (Implementation Plan v3)
3. Dokumen ini (`docs/implementation/subscription-execution-guardrail.md`)
4. `docs/implementation/subscription-component-prompts.md`
5. `docs/implementation/subscription-verification-prompts.md`

> **BLOCKED STATE:** Apabila salah satu dokumen di atas tidak ditemukan, agen harus menandai status sebagai **BLOCKED**, tidak membuat dokumen pengganti otomatis, dan segera melapor kepada pengguna.

## 2. One-Component Rule (Satu per Satu)
Agen **hanya boleh** mengerjakan **satu Component Prompt ID dalam satu siklus kerja** (misal: hanya `P0-01`).
- Dilarang mengerjakan prompt berikutnya secara otomatis.
- Dilarang mengerjakan seluruh fase dalam satu PR/commit besar.
- Dilarang memperluas scope di luar instruksi spesifik komponen yang sedang aktif.

## 3. Mandatory Preflight (Audit-Only)
Setiap Component Prompt wajib dimulai dengan mode **audit-only**. 
Pada tahap ini, agen **hanya diperbolehkan melakukan operasi read-only**, meliputi:
- Membaca file
- Mencari symbol atau route
- Menjalankan `git status` dan `git diff`
- Menjalankan command inspeksi yang tidak menulis file
- Membuka dokumentasi resmi
- Menjalankan CLI dengan flag `--dry-run` (jika dipastikan tidak memodifikasi apa pun)

> **LARANGAN:** Agen dilarang keras mengubah file, menginstal dependency, menjalankan generator, atau membuat commit pada tahap ini.

Sebelum modifikasi dilakukan, agen **wajib melaporkan Preflight Report**:
- Prompt aktif
- Tujuan
- Source of truth yang sudah dibaca
- Existing implementation yang ditemukan
- Files yang akan dibaca & diubah
- Dependency yang terlibat
- Risiko utama
- Acceptance criteria & Verification plan
Implementasi hanya dimulai **setelah** mendapat persetujuan pengguna.

## 4. Scope Control & Dependency Safety
- Dilarang melakukan refactor pada kode lama yang tidak relevan atau tidak menghalangi prompt aktif.
- Dilarang mengubah file di luar daftar *Files allowed to modify*.
- Dilarang menginstal dependency tanpa audit eksplisit dan persetujuan pengguna.
- Base UI shadcn yang digunakan adalah versi murni; dilarang menggunakan Lucide atau Radix jika tidak disetujui.

## 5. Stop Conditions
Berhenti segera dan laporkan (tanpa menerapkan *workaround* diam-diam) jika:
- Repository berbeda secara material dari asumsi plan.
- File atau route target tidak ditemukan.
- Diperlukan file tambahan di luar scope yang diizinkan.
- Dependency baru belum disetujui pengguna.
- Eksekusi CLI/shadcn menghasilkan library yang dilarang (seperti Lucide/Radix).
- Perubahan berisiko memengaruhi navbar atau reset CSS global.
- Diperlukan selector global yang dilarang.
- Terdapat kontradiksi antara dokumentasi resmi (shadcn/React Bits) dengan asumsi prompt.
- Acceptance criteria tidak bisa dicapai tanpa memperluas scope.

*Format Laporan:*
```
STOPPED
Temuan: ...
Dampak: ...
File terkait: ...
Pilihan aman: ...
Keputusan yang dibutuhkan: ...
```

## 6. Evidence-Based Completion & Completion Boundary
Keberhasilan diukur dari **ketepatan menyelesaikan scope**, bukan kuantitas perubahan.
Saat menyelesaikan sebuah prompt, agen wajib menyerahkan **Completion Report**:
- Component Prompt ID
- Status: PASS / PARTIAL / BLOCKED
- Perubahan yang diterapkan
- Files yang berubah
- Command dan verification yang dijalankan (serta hasilnya/exit code)
- Acceptance criteria checklist
- Regression check (misal: Navbar aman)
- Known limitations & Out-of-scope findings
- Hal yang sengaja tidak diubah

## 7. Commit Rule
Setelah memberikan Completion Report, agen wajib **BERHENTI**.
- Tampilkan *suggested commit message* kepada pengguna.
- **Commit HANYA dibuat setelah pengguna memberikan instruksi eksplisit.**
