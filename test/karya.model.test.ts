import { describe, expect, test } from "bun:test";
import { UserModel } from "../src/models/user.model";
import { KaryaModel } from "../src/models/karya.model";
import { createTestDb } from "./helpers";

async function seed(db: ReturnType<typeof createTestDb>, username = "siti") {
  const users = new UserModel(db);
  const userId = await users.create(username, "rahasia123");
  return { userId, karya: new KaryaModel(db) };
}

describe("KaryaModel", () => {
  test("create → list (join username) → byUser", async () => {
    const db = createTestDb();
    const { userId, karya } = await seed(db);

    karya.create({
      userId,
      judul: "Poster Event",
      deskripsi: "Poster konser",
      kategori: "desain",
      mediaPath: "uploads/a.jpg",
      mediaType: "image/jpeg",
    });

    const list = karya.list() as Array<{ judul: string; username: string }>;
    expect(list).toHaveLength(1);
    expect(list[0].judul).toBe("Poster Event");
    expect(list[0].username).toBe("siti");

    expect(karya.byUser(userId)).toHaveLength(1);
    expect(karya.byUser("user-lain")).toHaveLength(0);
  });

  test("list dengan filter kategori", async () => {
    const db = createTestDb();
    const { userId, karya } = await seed(db);

    karya.create({ userId, judul: "A", deskripsi: "", kategori: "desain", mediaPath: "uploads/a.jpg", mediaType: "image/jpeg" });
    karya.create({ userId, judul: "B", deskripsi: "", kategori: "motion", mediaPath: "uploads/b.mp4", mediaType: "video/mp4" });

    expect((karya.list("desain") as unknown[]).length).toBe(1);
    expect((karya.list("motion") as unknown[]).length).toBe(1);
    expect((karya.list("fotografi") as unknown[]).length).toBe(0);
  });

  test("toggleLike: like → unlike", async () => {
    const db = createTestDb();
    const { karya } = await seed(db);

    // butuh user valid karena FK implicit (tanpa FK constraint, id bebas)
    const userId = "sembarang-id";
    const id = karya.create({ userId, judul: "A", deskripsi: "", kategori: "desain", mediaPath: "uploads/a.jpg", mediaType: "image/jpeg" });

    expect(karya.toggleLike(id, "liker-1")).toBe(true);
    expect(karya.toggleLike(id, "liker-1")).toBe(false);
    expect(karya.toggleLike(id, "liker-2")).toBe(true);
  });
});
