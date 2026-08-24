# Contributing — CoSign

Terima kasih mau berkontribusi! 🎉 Ikuti standar di bawah supaya review cepat & kode rapi.

## Branch

- Selalu branch dari `main`: `git checkout -b feat/nama-fitur`
- Prefiks branch: `feat/` `fix/` `docs/` `refactor/` `test/`

## Commit (Conventional Commits)

```
feat: tambah komentar pada karya
fix: perbaiki upload video gagal
docs: update README cara deploy
test: tambah unit test UserModel
refactor: pisah middleware auth
```

Jenis umum: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`.

## Sebelum Pull Request

1. Jalankan `bun test` — pastikan semua lulus
2. Jalankan `bun run build:css` kalau menyentuh class Tailwind
3. Cek tidak ada secret ter-commit (`.env`, `SUPABASE_URL`, dll.)
4. Buka PR pakai template `.github/pull_request_template.md`
5. Review minimal 1 orang sebelum merge (merge ke `main`)

## Testing

- Framework: `bun test` (test files di folder `test/`)
- DB test pakai SQLite in-memory (`:memory:`) — tidak menyentuh `data/app.db`
- Tambahkan test untuk setiap model/controller baru

## Keamanan

- Jangan pernah commit `.env` atau key apa pun
- Password wajib di-hash (`Bun.password`), jangan simpan plaintext
- Kalau menemukan celah keamanan, laporkan via issue (jangan publish dulu)
