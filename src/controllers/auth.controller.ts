import { Hono } from "hono";
import type { Db } from "../db";
import { UserModel } from "../models/user.model";
import {
  createSession,
  destroySession,
  getUserId,
} from "../middleware/auth.middleware";

/** Controller: /api/auth — register, login, logout, me. */
export function authController(db: Db) {
  const api = new Hono();

  if (!db.sqlite) {
    api.all("*", (c) => c.json({ error: "mode supabase belum diimplementasikan" }, 501));
    return api;
  }

  const users = new UserModel(db.sqlite);

  api.post("/register", async (c) => {
    const { username, password, full_name } = await c.req.json();
    if (!username || !password) {
      return c.json({ error: "username & password wajib" }, 400);
    }
    if (users.findByUsername(username)) {
      return c.json({ error: "username sudah dipakai" }, 409);
    }

    const id = await users.create(username, password, full_name);
    await createSession(c, db, id);
    return c.json({ ok: true, username }, 201);
  });

  api.post("/login", async (c) => {
    const { username, password } = await c.req.json();
    const id = await users.verifyPassword(username, password);
    if (!id) return c.json({ error: "username/password salah" }, 401);

    await createSession(c, db, id);
    return c.json({ ok: true, username });
  });

  api.post("/logout", (c) => {
    destroySession(c, db);
    return c.json({ ok: true });
  });

  api.get("/me", (c) => {
    const userId = getUserId(c, db);
    if (!userId) return c.json({ user: null });
    return c.json({ user: users.findPublic(userId) });
  });

  return api;
}
