# CoSign

Platform portofolio anak Creative Media (CM) — share karya, explore karya teman.
Simple stack: **Bun + Hono + SQLite + Tailwind + vanilla JS**.

## Quickstart

```bash
bun install
bun run dev        # terminal 1: server di http://localhost:3000 (hot reload)
bun run dev:css    # terminal 2: compile Tailwind (watch)
```

Build CSS produksi: `bun run build:css` — hasilnya `public/style.css`.

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

## Berkontribusi

1. Branch dari `main`: `feat/nama-fitur` (atau `fix/`, `docs/`, `refactor/`, `test/`)
2. Commit pakai [Conventional Commits](https://www.conventionalcommits.org/)
3. Pastikan `bun test` hijau
4. Buka Pull Request — template otomatis: `.github/pull_request_template.md`
5. Detail lengkap: [CONTRIBUTING.md](CONTRIBUTING.md)

## Struktur (MVC)

```
src/
  index.ts                # entry: Hono app, middleware global, static files
  db.ts                   # koneksi DB (env-driven: sqlite | supabase) + migrasi
  models/                 # MODEL — akses data / query SQL
    user.model.ts         #   users: register, verifikasi password, profil publik
    session.model.ts      #   sessions: create/find/delete session cookie
    karya.model.ts        #   karya + likes: list, upload, toggle like
  controllers/            # CONTROLLER — parse request → panggil model → response
    auth.controller.ts    #   /api/auth: register, login, logout, me
    karya.controller.ts   #   /api/karya: explore, upload, like
    profile.controller.ts #   /api/profile: halaman profil publik
  middleware/
    auth.middleware.ts    # session cookie helpers + requireAuth
  routes/
    index.ts              # router: pasang controller ke /api/*
public/                   # VIEW — HTML statis + vanilla JS + CSS (hasil Tailwind)
  index.html              #   landing/explore
  app.js                  #   fetch ke API
  style.css               #   hasil compile Tailwind (jangan diedit manual)
supabase/migrations/      # skema SQL versi Supabase (opsional)
```

Alur: **View** (public/) → fetch ke **Routes** → **Controller** → **Model** → SQLite.

## API

```
POST /api/auth/register        # {username, password, full_name}
POST /api/auth/login           # {username, password} → session cookie
POST /api/auth/logout
GET  /api/auth/me              # user yang sedang login (null kalau belum)
GET  /api/karya?kategori=      # list karya (explore + filter)
POST /api/karya                # multipart: judul, deskripsi, kategori, media (wajib login)
POST /api/karya/:id/like       # toggle like (wajib login)
GET  /api/profile/:username    # profil publik + karyanya
```

## Ganti ke Supabase

1. `bun add @supabase/supabase-js`
2. Apply `supabase/migrations/001_init.sql` di Supabase (SQL Editor / `supabase db push`)
3. Copy `.env.example` → `.env`, set:
   ```
   DB_DRIVER=supabase
   SUPABASE_URL=...
   SUPABASE_ANON_KEY=...
   ```

Catatan: route saat ini sqlite-first. Saat pindah Supabase, tambahkan branch
`db.supabase` di tiap route (pola `if (db.sqlite) { ... } else { ... }`).

## Keamanan (sudah terpasang)

- Cookie session `httpOnly` + `sameSite=Lax`
- Password di-hash dengan `Bun.password` (argon2)
- `hono/csrf` + `secureHeaders` + `cors` di middleware
