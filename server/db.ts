import { and, eq, lte, like, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { distros, InsertDistro, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
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
}

export async function getDistroById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(distros).where(eq(distros.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDistro(data: Omit<InsertDistro, "id" | "createdAt" | "updatedAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(distros).values(data);
  return result;
}

export async function updateDistro(id: number, data: Partial<Omit<InsertDistro, "id" | "createdAt" | "updatedAt">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(distros).set(data).where(eq(distros.id, id));
}

export async function deleteDistro(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(distros).where(eq(distros.id, id));
}
