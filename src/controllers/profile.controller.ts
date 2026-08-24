import { Hono } from "hono";
import type { Db } from "../db";
import { UserModel } from "../models/user.model";
import { KaryaModel } from "../models/karya.model";

/** Controller: /api/profile — halaman profil publik + karyanya. */
export function profileController(db: Db) {
  const api = new Hono();

  if (!db.sqlite) {
    api.all("*", (c) => c.json({ error: "mode supabase belum diimplementasikan" }, 501));
    return api;
  }

  const users = new UserModel(db.sqlite);
  const karya = new KaryaModel(db.sqlite);

  // GET /api/profile/:username
  api.get("/:username", (c) => {
    const user = users.findByUsernamePublic(c.req.param("username"));
    if (!user) return c.json({ error: "user tidak ditemukan" }, 404);
    return c.json({
      user,
      karya: karya.byUser((user as { id: string }).id),
    });
  });

  return api;
}
