# AGENTS.md — Panduan untuk AI & Developer

Panduan kerja pada repositori **CoSign**. Baca ini sebelum mengubah kode agar
tidak merusak struktur, path import, atau konvensi yang sudah ada.

## Ringkasan Proyek

Platform portofolio anak **Creative Media (CM)** — share karya, explore karya
teman, like, dan punya halaman profil publik.

Stack: **Bun + Hono + SQLite + Tailwind + vanilla JS** (MVC).

Arsitektur alur:
**View** (`public/`) → fetch → **Routes** (`src/routes/`) → **Controller**
(`src/controllers/`) → **Model** (`src/models/`) → SQLite.

## Standar Kontribusi & Open Source

Repositori ini publik (open source) di `ccit-venture/cosign`. Perhatikan:

- **Template issue/PR** ada di `.github/` — saat membuat PR wajib melengkapi
  checklist yang ada di `PULL_REQUEST_TEMPLATE.md`.
- **CONTRIBUTING.md** berisi panduan fork, clone, sinkron upstream, dan gaya
  commit. AJAK kontributor baru membaca file ini dan `AGENTS.md`.
- **Kode Etik** di `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1 — Bahasa
  Indonesia). Kontak penegakan: mhudyaramadhana@gmail.com (Hudya).
- **Keamanan**: laporkan via SECURITY.md (jangan buka issue publik).
- **CI (`.github/workflows/ci.yml`)**: `bun install` + `bun test` +
  `bun run build:css` di setiap push/PR ke `master`. Pastikan semua hijau
  sebelum merge.

## Struktur Penting (`src/`)

```
src/
├── index.ts                # entry: server Bun (port 3000). JANGAN taruh logika bisnis di sini
├── app.ts                  # createApp(db): middleware global + static files. Dipakai server & test
├── db.ts                   # initDb() (sqlite | supabase) + migrate(). Skema SQL ada di sini (mode sqlite)
├── models/                 # MODEL — query SQL. Satu class per tabel/domain
│   ├── user.model.ts       #   users
│   ├── session.model.ts    #   sessions
│   └── karya.model.ts      #   karya + likes
├── controllers/            # CONTROLLER — parse request → panggil model → response JSON
│   ├── auth.controller.ts
│   ├── karya.controller.ts
│   └── profile.controller.ts
├── middleware/
│   └── auth.middleware.ts  # getUserId / createSession / destroySession / requireAuth
├── routes/
│   └── index.ts            # api(db): pasang controller di bawah /api/*
└── styles/input.css        # sumber Tailwind (compile → public/style.css)
```

## Konvensi Penting

- **DB driver env-driven** (`src/db.ts`): `DB_DRIVER=sqlite` (default) atau
  `supabase`. Mode supabase **belum diimplementasikan** — tiap controller
  mengecek `if (!db.sqlite)` lalu return `501`. JANGAN hapus guard ini.
- **`createApp(db)`** — aplikasi Hono dibangun dari instance `Db`. Server
  (`src/index.ts`) dan unit test (`test/helpers.ts`) sama-sama memakainya.
- **Session cookie** `sid` (httpOnly, 7 hari) — helper di
  `src/middleware/auth.middleware.ts`. Route yang butuh login memakai
  `requireAuth(db)` dan membaca `c.get("userId")`.
- **Upload** disimpan di `uploads/` (nama file randomUUID + ekstensi asli), lalu
  di-serve lewat `serveStatic` di `src/app.ts`. Meta-nya disimpan di tabel
  `karya` (`media_path`).
- **Password** wajib `Bun.password.hash` / `Bun.password.verify` (argon2).
  JANGAN simpan plaintext.
- **`.env`** TIDAK pernah di-commit (sudah di `.gitignore`). Cukup ikuti
  `.env.example`.

## Cara Menjalankan

```bash
bun install
bun run dev        # terminal 1: server http://localhost:3000 (hot reload)
bun run dev:css    # terminal 2: compile Tailwind (watch)
```

## Menjalankan Test

```bash
bun test
```

DB test memakai SQLite **in-memory** (`:memory:` di `test/helpers.ts`) — tidak
menyentuh `data/app.db`. Tambahkan test untuk setiap model/controller baru.

## Hal yang Sering Salah

- **Meletakkan logika bisnis di `src/index.ts`** — entry hanya inisialisasi;
  semua logika di controller/model.
- **Mengedit `public/style.css` langsung** — itu hasil compile Tailwind. Ubah
  `src/styles/input.css` lalu jalankan `bun run build:css`.
- **Menghapus guard `if (!db.sqlite)`** di controller — akan memecah mode
  sqlite-first.
- **Commit file `.env` / `data/` / `uploads/`** — sudah di-ignore, jangan di-add
  paksa (`git add -f`).
- **Menambah route tanpa tes** — setiap endpoint baru sebaiknya punya coverage
  di `test/`.
