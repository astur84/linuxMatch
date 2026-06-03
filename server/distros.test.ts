import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  listDistros: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Ubuntu",
      description: "Ubuntu es una distribución Linux.",
      category: "General",
      ramMin: 1024,
      difficulty: "Principiante",
      purpose: "General",
      architecture: "64-bit",
      logoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getDistroById: vi.fn().mockResolvedValue({
    id: 1,
    name: "Ubuntu",
    description: "Ubuntu es una distribución Linux.",
    category: "General",
    ramMin: 1024,
    difficulty: "Principiante",
    purpose: "General",
    architecture: "64-bit",
    logoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  createDistro: vi.fn().mockResolvedValue({ insertId: 2 }),
  updateDistro: vi.fn().mockResolvedValue(undefined),
  deleteDistro: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

function makeCtx(role: "user" | "admin" | null = null): TrpcContext {
  const user =
    role !== null
      ? {
          id: 1,
          openId: "test-open-id",
          name: "Test User",
          email: "test@example.com",
          loginMethod: "manus",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        }
      : null;

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("distros.list", () => {
  it("returns distros for public users", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.distros.list({});
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("name");
  });

  it("accepts filter parameters", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    const result = await caller.distros.list({
      difficulty: "Principiante",
      purpose: "General",
      architecture: "64-bit",
    });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("distros.create", () => {
  it("allows admin to create a distro", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.distros.create({
      name: "Test Distro",
      description: "A test distribution for testing purposes.",
      category: "General",
      ramMin: 512,
      difficulty: "Principiante",
      purpose: "General",
      architecture: "64-bit",
      logoUrl: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.distros.create({
        name: "Test",
        description: "Test description for the distro.",
        category: "General",
        ramMin: 512,
        difficulty: "Principiante",
        purpose: "General",
        architecture: "64-bit",
        logoUrl: null,
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx(null));
    await expect(
      caller.distros.create({
        name: "Test",
        description: "Test description for the distro.",
        category: "General",
        ramMin: 512,
        difficulty: "Principiante",
        purpose: "General",
        architecture: "64-bit",
        logoUrl: null,
      })
    ).rejects.toThrow();
  });
});

describe("distros.delete", () => {
  it("allows admin to delete a distro", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.distros.delete({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.distros.delete({ id: 1 })).rejects.toThrow();
  });
});
