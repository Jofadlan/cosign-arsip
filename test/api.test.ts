import { describe, expect, test } from "bun:test";
import { createTestApp, cookieFrom, jsonHeaders } from "./helpers";

describe("API — health & ping", () => {
  test("GET /api/ping → { pong: true }", async () => {
    const app = createTestApp();
    const res = await app.request("/api/ping");
    expect(await res.json()).toEqual({ pong: true });
  });

  test("GET /health → driver sqlite", async () => {
    const app = createTestApp();
    const res = await app.request("/health");
    expect((await res.json()).driver).toBe("sqlite");
  });
});

describe("API — auth", () => {
  test("register → 201 + cookie session", async () => {
    const app = createTestApp();
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username: "tes", password: "rahasia123", full_name: "User Tes" }),
    });
    expect(res.status).toBe(201);
    expect(cookieFrom(res)).toContain("sid=");
  });

  test("register username duplikat → 409", async () => {
    const app = createTestApp();
    const body = JSON.stringify({ username: "tes", password: "rahasia123" });
    await app.request("/api/auth/register", { method: "POST", headers: jsonHeaders, body });
    const res = await app.request("/api/auth/register", { method: "POST", headers: jsonHeaders, body });
    expect(res.status).toBe(409);
  });

  test("/api/auth/me tanpa login → user null", async () => {
    const app = createTestApp();
    const res = await app.request("/api/auth/me");
    expect((await res.json()).user).toBeNull();
  });

  test("me dengan cookie → user kebaca", async () => {
    const app = createTestApp();
    const reg = await app.request("/api/auth/register", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username: "tes", password: "rahasia123" }),
    });
    const cookie = cookieFrom(reg);

    const me = await app.request("/api/auth/me", { headers: { cookie } });
    const json = await me.json();
    expect(json.user.username).toBe("tes");
    expect(json.user.password_hash).toBeUndefined();
  });

  test("login: password salah → 401, benar → cookie", async () => {
    const app = createTestApp();
    await app.request("/api/auth/register", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username: "tes", password: "rahasia123" }),
    });

    const wrong = await app.request("/api/auth/login", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username: "tes", password: "salah" }),
    });
    expect(wrong.status).toBe(401);

    const ok = await app.request("/api/auth/login", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username: "tes", password: "rahasia123" }),
    });
    expect(ok.status).toBe(200);
    expect(cookieFrom(ok)).toContain("sid=");
  });

  test("logout menghapus session", async () => {
    const app = createTestApp();
    const reg = await app.request("/api/auth/register", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username: "tes", password: "rahasia123" }),
    });
    const cookie = cookieFrom(reg);

    await app.request("/api/auth/logout", { method: "POST", headers: { ...jsonHeaders, cookie } });
    const me = await app.request("/api/auth/me", { headers: { cookie } });
    expect((await me.json()).user).toBeNull();
  });
});

describe("API — karya", () => {
  test("upload tanpa login → 401", async () => {
    const app = createTestApp();
    const res = await app.request("/api/karya", { method: "POST", headers: { origin: "http://localhost:3000" } });
    expect(res.status).toBe(401);
  });

  test("upload → list explore → profil publik", async () => {
    const app = createTestApp();
    const reg = await app.request("/api/auth/register", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username: "tes", password: "rahasia123" }),
    });
    const cookie = cookieFrom(reg);

    const form = new FormData();
    form.append("judul", "Poster Event");
    form.append("deskripsi", "Poster konser amal");
    form.append("kategori", "desain");
    form.append("media", new File(["data"], "poster.jpg", { type: "image/jpeg" }));

    const up = await app.request("/api/karya", {
      method: "POST",
      headers: { cookie, origin: "http://localhost:3000" },
      body: form,
    });
    expect(up.status).toBe(201);

    const list = await (await app.request("/api/karya")).json();
    expect(list.karya).toHaveLength(1);
    expect(list.karya[0].judul).toBe("Poster Event");
    expect(list.karya[0].username).toBe("tes");

    const profile = await (await app.request("/api/profile/tes")).json();
    expect(profile.user.username).toBe("tes");
    expect(profile.karya).toHaveLength(1);
  });

  test("like: toggle on/off", async () => {
    const app = createTestApp();
    const reg = await app.request("/api/auth/register", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ username: "tes", password: "rahasia123" }),
    });
    const cookie = cookieFrom(reg);

    const form = new FormData();
    form.append("judul", "Karya 1");
    form.append("media", new File(["data"], "k1.jpg", { type: "image/jpeg" }));
    const up = await app.request("/api/karya", {
      method: "POST",
      headers: { cookie, origin: "http://localhost:3000" },
      body: form,
    });
    const { id } = await up.json();

    const like1 = await app.request(`/api/karya/${id}/like`, { method: "POST", headers: { cookie, origin: "http://localhost:3000" } });
    expect((await like1.json()).liked).toBe(true);
    const like2 = await app.request(`/api/karya/${id}/like`, { method: "POST", headers: { cookie, origin: "http://localhost:3000" } });
    expect((await like2.json()).liked).toBe(false);
  });
});
