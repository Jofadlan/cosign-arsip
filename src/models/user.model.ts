import { randomUUID } from "crypto";
import type { Database } from "bun:sqlite";

/** Model: tabel users. */
export class UserModel {
  constructor(private db: Database) {}

  /** Cari user lengkap (termasuk password_hash) by username — untuk login. */
  findByUsername(username: string) {
    return this.db
      .query("SELECT id, username, password_hash FROM users WHERE username = ?")
      .get(username);
  }

  /** Ambil data publik user by id (tanpa password). */
  findPublic(id: string) {
    return this.db
      .query("SELECT id, username, full_name, bio FROM users WHERE id = ?")
      .get(id);
  }

  /** Ambil data publik user by username (untuk halaman profil). */
  findByUsernamePublic(username: string) {
    return this.db
      .query(
        "SELECT id, username, full_name, bio FROM users WHERE username = ?"
      )
      .get(username);
  }

  /** Register: hash password, simpan user, return id. */
  async create(username: string, password: string, fullName?: string): Promise<string> {
    const id = randomUUID();
    const hash = await Bun.password.hash(password);
    this.db
      .query(
        "INSERT INTO users (id, username, full_name, password_hash) VALUES (?, ?, ?, ?)"
      )
      .run(id, username, fullName ?? null, hash);
    return id;
  }

  /** Verifikasi login: return userId kalau password benar, null kalau salah. */
  async verifyPassword(username: string, password: string): Promise<string | null> {
    const row = this.findByUsername(username) as
      | { id: string; password_hash: string }
      | null;
    if (!row) return null;
    const ok = await Bun.password.verify(password, row.password_hash);
    return ok ? row.id : null;
  }
}
