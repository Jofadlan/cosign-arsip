# CoSign

> Platform portofolio anak Creative Media (CM) — share karya, explore karya teman,
> dan bangun identitas angkatan. Terinspirasi dari [blush.design](https://blush.design).

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Stack](https://img.shields.io/badge/stack-Bun%20%7C%20Hono%20%7C%20SQLite-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Latar Belakang

Anak Creative Media butuh tempat untuk memamerkan karya dan membangun identitas
angkatan. CoSign menjawabnya dengan platform sederhana: setiap siswa bisa
**upload karya** (poster, desain, video, dll.), **explore** karya teman,
**like**, dan punya **halaman profil publik**.

## Arsitektur

Alur: View (frontend statis) → fetch ke API (Hono) → Controller → Model → SQLite.

```mermaid
flowchart LR
    Browser["Browser<br/>public/ · HTML + vanilla JS + Tailwind"]
    API["Hono API<br/>/api/* · Middleware auth/session"]
    Ctrl["Controllers<br/>auth · karya · profile"]
    Model["Models<br/>user · session · karya"]
    DB[("SQLite<br/>data/app.db")]

    Browser -->|fetch| API
    API --> Ctrl
    Ctrl --> Model
    Model --> DB
    DB -->|"files<br/>uploads/"| Browser
```

**Keamanan terpasang:** cookie session `httpOnly` + `sameSite=Lax`, password
di-hash argon2 (`Bun.password`), `hono/csrf` + `secureHeaders` + `cors`.

---

## Struktur Repository (MVC)

```
cosign/
├── src/
│   ├── index.ts                # entry: server Bun (port 3000, hot reload)
│   ├── app.ts                  # build Hono app + middleware global + static
│   ├── db.ts                   # koneksi DB (sqlite | supabase) + migrasi
│   ├── models/                 # MODEL — akses data / query SQL
│   │   ├── user.model.ts       #   users: register, verifikasi password, profil
│   │   ├── session.model.ts    #   sessions: create/find/delete session cookie
│   │   └── karya.model.ts      #   karya + likes: list, upload, toggle like
│   ├── controllers/            # CONTROLLER — parse request → model → response
│   │   ├── auth.controller.ts  #   /api/auth: register, login, logout, me
│   │   ├── karya.controller.ts #   /api/karya: explore, upload, like
│   │   └── profile.controller.ts # /api/profile: halaman profil publik
│   ├── middleware/
│   │   └── auth.middleware.ts  # session cookie helpers + requireAuth
│   ├── routes/
│   │   └── index.ts            # router: pasang controller ke /api/*
│   └── styles/input.css        # sumber Tailwind (compile → public/style.css)
├── public/                     # VIEW — HTML statis + vanilla JS + CSS hasil
│   ├── index.html              #   landing/explore
│   ├── app.js                  #   fetch ke API
│   └── style.css               #   hasil compile Tailwind (jangan diedit manual)
├── supabase/migrations/        # skema SQL versi Supabase (opsional)
├── test/                       # unit test (`bun test`, SQLite in-memory)
└── .github/                    # template issue/PR + CI
```

---

## Quickstart

```bash
bun install
bun run dev        # terminal 1: server di http://localhost:3000 (hot reload)
bun run dev:css    # terminal 2: compile Tailwind (watch)
```

Build CSS produksi: `bun run build:css` — hasilnya `public/style.css`.

---

## API

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Daftar `{username, password, full_name}` | - |
| POST | `/api/auth/login` | Login → session cookie | - |
| POST | `/api/auth/logout` | Hapus session | ✓ |
| GET | `/api/auth/me` | User yang sedang login (null kalau belum) | - |
| GET | `/api/karya?kategori=` | List karya (explore + filter) | - |
| POST | `/api/karya` | Upload karya (multipart: judul, deskripsi, kategori, media) | ✓ |
| POST | `/api/karya/:id/like` | Toggle like | ✓ |
| GET | `/api/profile/:username` | Profil publik + karyanya | - |

Health check: `GET /api/ping` → `{ pong: true }`, `GET /health` → status driver DB.

---

## Testing

```bash
bun test
```

Unit test pakai `bun test` (folder `test/`). DB test memakai SQLite **in-memory** —
tidak menyentuh `data/app.db`. Cakupan saat ini:

| File | Menguji |
|---|---|
| `test/session.model.test.ts` | create/find/delete session |
| `test/user.model.test.ts` | register, verifikasi password, tanpa bocor hash |
| `test/karya.model.test.ts` | list + filter kategori, byUser, toggle like |
| `test/api.test.ts` | integrasi API: auth flow, 401, upload, like, profil |

CI otomatis menjalankan `bun test` + `bun run build:css` di setiap push/PR ke
`master`.

---

## Ganti ke Supabase

1. `bun add @supabase/supabase-js`
2. Apply `supabase/migrations/001_init.sql` di Supabase (SQL Editor / `supabase db push`)
3. Copy `.env.example` → `.env`, set:
   ```
   DB_DRIVER=supabase
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```

Catatan: route saat ini **sqlite-first**. Saat pindah Supabase, tambahkan branch
`db.supabase` di tiap route (pola `if (db.sqlite) { ... } else { ... }`).

---

## Roadmap

- **Frontend fungsional** — halaman login/upload/explore yang benar-benar
  mengonsumsi API (saat ini masih placeholder ping).
- **Supabase driver** — implementasikan branch `db.supabase` di tiap controller.
- **Komentar pada karya** — diskusi antar siswa per karya.
- **Follow antar user** — bangun feed personal.

Lihat [issue-issue](https://github.com/ccit-venture/cosign/issues) untuk daftar
pekerjaan yang sedang/akan dikerjakan.

---

## Kontribusi

Project ini **open source** — kontribusi sangat terbuka! Cara paling cepat:

1. **Fork** repository
2. Buat branch fitur: `git checkout -b feat/nama-fitur`
3. Jalankan test: `bun test`
4. Buat **Pull Request** dengan mengisi template yang sudah disediakan

Panduan lengkap (fork, sinkron upstream, gaya commit) →
[CONTRIBUTING.md](CONTRIBUTING.md). Sebelum mengubah kode, baca juga
[AGENTS.md](AGENTS.md) untuk konvensi struktur & hal yang sering salah.

Komunitas berpegang pada [Kode Etik](CODE_OF_CONDUCT.md). Untuk masalah
keamanan, jangan buka issue publik — lihat [SECURITY.md](SECURITY.md).

---

## Kontributor

| Nama | Peran |
|------|-------|
| Muhammad Hudya Ramadhana | Maintainer, backend & API |

**Institusi:** CEP CCIT-FTUI

---

## Lisensi

MIT License — bebas digunakan dengan menyertakan atribusi.

---

<p align="center">
  <sub>CoSign · Venture Studio CCIT-FTUI</sub>
</p>
