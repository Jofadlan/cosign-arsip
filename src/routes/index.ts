import { Hono } from "hono";
import type { Db } from "../db";
import { authController } from "../controllers/auth.controller";
import { karyaController } from "../controllers/karya.controller";
import { profileController } from "../controllers/profile.controller";

/** Router: pasang semua controller di bawah /api. */
export function api(db: Db) {
  const api = new Hono();

  api.get("/ping", (c) => c.json({ pong: true }));

  api.route("/auth", authController(db)); // /api/auth/*
  api.route("/karya", karyaController(db)); // /api/karya*
  api.route("/profile", profileController(db)); // /api/profile/*

  return api;
}
