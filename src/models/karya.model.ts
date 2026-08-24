import { randomUUID } from "crypto";
import type { Database } from "bun:sqlite";

/** Model: tabel karya + likes. */
export class KaryaModel {
  constructor(private db: Database) {}

  /** List semua karya (explore), optional filter kategori. */
  list(kategori?: string) {
    return kategori
      ? this.db
          .query(
            "SELECT k.*, u.username FROM karya k JOIN users u ON u.id = k.user_id WHERE k.kategori = ? ORDER BY k.created_at DESC"
          )
          .all(kategori)
      : this.db
          .query(
            "SELECT k.*, u.username FROM karya k JOIN users u ON u.id = k.user_id ORDER BY k.created_at DESC"
          )
          .all();
  }

  /** List karya milik satu user. */
  byUser(userId: string) {
    return this.db
      .query("SELECT * FROM karya WHERE user_id = ? ORDER BY created_at DESC")
      .all(userId);
  }

  /** Simpan karya baru, return id. */
  create(data: {
    userId: string;
    judul: string;
    deskripsi: string;
    kategori: string;
    mediaPath: string;
    mediaType: string;
  }): string {
    const id = randomUUID();
    this.db
      .query(
        "INSERT INTO karya (id, user_id, judul, deskripsi, kategori, media_path, media_type) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .run(
        id,
        data.userId,
        data.judul,
        data.deskripsi,
        data.kategori,
        data.mediaPath,
        data.mediaType
      );
    return id;
  }

  /** Toggle like: return true kalau jadi like, false kalau unlike. */
  toggleLike(karyaId: string, userId: string): boolean {
    const exists = this.db
      .query("SELECT 1 FROM likes WHERE karya_id = ? AND user_id = ?")
      .get(karyaId, userId);
    if (exists) {
      this.db
        .query("DELETE FROM likes WHERE karya_id = ? AND user_id = ?")
        .run(karyaId, userId);
      return false;
    }
    this.db
      .query("INSERT INTO likes (karya_id, user_id) VALUES (?, ?)")
      .run(karyaId, userId);
    return true;
  }
}
