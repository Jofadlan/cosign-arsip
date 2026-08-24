import { Hono } from "hono";
import { randomUUID } from "crypto";
import { mkdirSync } from "fs";
import type { Db } from "../db";
import { KaryaModel } from "../models/karya.model";
import { requireAuth } from "../middleware/auth.middleware";

/** Controller: /api/karya — list, upload karya, like. */
export function karyaController(db: Db) {
  const api = new Hono();

  if (!db.sqlite) {
    api.all("*", (c) => c.json({ error: "mode supabase belum diimplementasikan" }, 501));
    return api;
  }

  const karya = new KaryaModel(db.sqlite);

  // GET /api/karya?kategori=desain — explore grid
  api.get("/", (c) => {
    return c.json({ karya: karya.list(c.req.query("kategori")) });
  });

  // POST /api/karya — upload karya baru (multipart, wajib login)
  api.post("/", requireAuth(db), async (c) => {
    const userId = c.get("userId") as string;
    const form = await c.req.formData();
    const judul = String(form.get("judul") ?? "");
    const deskripsi = String(form.get("deskripsi") ?? "");
    const kategori = String(form.get("kategori") ?? "lainnya");
    const media = form.get("media") as File | null;
    if (!judul || !media) {
      return c.json({ error: "judul & media wajib" }, 400);
    }

    const ext = media.name.split(".").pop() ?? "bin";
    const path = `uploads/${randomUUID()}.${ext}`;
    mkdirSync("uploads", { recursive: true });
    await Bun.write(path, media);

    const id = karya.create({
      userId,
      judul,
      deskripsi,
      kategori,
      mediaPath: path,
      mediaType: media.type,
    });
    return c.json({ ok: true, id }, 201);
  });

  // POST /api/karya/:id/like — toggle like (wajib login)
  api.post("/:id/like", requireAuth(db), (c) => {
    const liked = karya.toggleLike(c.req.param("id"), c.get("userId") as string);
    return c.json({ liked });
  });

  return api;
}
