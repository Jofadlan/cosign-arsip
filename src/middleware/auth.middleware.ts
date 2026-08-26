import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import type { Db } from "../db";
import { SessionModel } from "../models/session.model";

function sessions(db: Db) {
  return new SessionModel(db.sqlite!);
}

/** Get userId from session cookie (null if not logged in). */
export function getUserId(c: Context, db: Db): string | null {
  const sid = getCookie(c, "sid");
  if (!sid || !db.sqlite) return null;
  return sessions(db).findBySid(sid);
}

/** Create new session (httpOnly cookie, 7 days). */
export async function createSession(c: Context, db: Db, userId: string) {
  if (!db.sqlite) return;
  const sid = sessions(db).create(userId);
  setCookie(c, "sid", sid, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Delete session from DB + cookie. */
export function destroySession(c: Context, db: Db) {
  const sid = getCookie(c, "sid");
  if (sid && db.sqlite) sessions(db).delete(sid);
  deleteCookie(c, "sid");
}

/** Middleware: require login. Sets c.set("userId"). Redirects to login. */
export function requireAuth(db: Db) {
  return async (c: Context, next: Next) => {
    const userId = getUserId(c, db);
    if (!userId) return c.redirect("/admin/login", 302);
    c.set("userId", userId);
    await next();
  };
}

/** Middleware guest: for login/register pages — logged-in users go to /admin/karya. */
export function redirectIfAuthenticated(db: Db) {
  return async (c: Context, next: Next) => {
    const userId = getUserId(c, db);
    if (userId) return c.redirect("/admin/karya", 302);
    await next();
  };
}