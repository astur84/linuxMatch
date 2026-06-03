import { and, eq, lte, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { distros, InsertDistro, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    // Check if user exists
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);

    if (existing.length > 0) {
      // Update existing user
      const updateData: Record<string, unknown> = {};
      if (user.name !== undefined) updateData.name = user.name;
      if (user.email !== undefined) updateData.email = user.email;
      if (user.loginMethod !== undefined) updateData.loginMethod = user.loginMethod;
      if (user.lastSignedIn !== undefined) updateData.lastSignedIn = user.lastSignedIn;
      if (user.role !== undefined) updateData.role = user.role;
      updateData.updatedAt = new Date();

      if (Object.keys(updateData).length > 0) {
        await db.update(users).set(updateData).where(eq(users.openId, user.openId));
      }
    } else {
      // Insert new user
      const insertData: InsertUser = {
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
        lastSignedIn: user.lastSignedIn ?? new Date(),
      };
      await db.insert(users).values(insertData);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get user:", error);
    return undefined;
  }
}

// ─── Distros ──────────────────────────────────────────────────────────────────

export interface DistroFilters {
  search?: string;
  ramMax?: number;
  difficulty?: string;
  purpose?: string;
  architecture?: string;
}

export async function listDistros(filters: DistroFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [];

    if (filters.ramMax && filters.ramMax > 0) {
      conditions.push(lte(distros.ramMin, filters.ramMax));
    }

    if (filters.search && filters.search.trim() !== "") {
      const term = `%${filters.search.trim()}%`;
      conditions.push(
        or(
          like(distros.name, term),
          like(distros.description, term),
          like(distros.category, term)
        )
      );
    }

    if (filters.difficulty && filters.difficulty !== "") {
      conditions.push(eq(distros.difficulty, filters.difficulty as "Principiante" | "Intermedio" | "Avanzado"));
    }

    if (filters.purpose && filters.purpose !== "") {
      conditions.push(eq(distros.purpose, filters.purpose as "General" | "Gaming" | "Servidores" | "Seguridad" | "PCs Antiguos"));
    }

    if (filters.architecture && filters.architecture !== "") {
      conditions.push(eq(distros.architecture, filters.architecture as "64-bit" | "ARM64" | "32-bit"));
    }

    let query = db.select().from(distros);
    if (conditions.length > 0) {
      // @ts-ignore
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(distros.name);
    return results;
  } catch (error) {
    console.error("[Database] Failed to list distros:", error);
    return [];
  }
}

export async function getDistroById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(distros).where(eq(distros.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get distro:", error);
    return undefined;
  }
}

export async function createDistro(data: Omit<InsertDistro, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(distros).values(data).returning();
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to create distro:", error);
    throw error;
  }
}

export async function updateDistro(id: number, data: Partial<Omit<InsertDistro, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.update(distros).set({ ...data, updatedAt: new Date() }).where(eq(distros.id, id));
  } catch (error) {
    console.error("[Database] Failed to update distro:", error);
    throw error;
  }
}

export async function deleteDistro(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db.delete(distros).where(eq(distros.id, id));
  } catch (error) {
    console.error("[Database] Failed to delete distro:", error);
    throw error;
  }
}
