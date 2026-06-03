import { bigint, boolean, pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * PostgreSQL schema for Supabase
 * Enums are defined as PostgreSQL types
 */
export const difficultyEnum = pgEnum("difficulty", ["Principiante", "Intermedio", "Avanzado"]);
export const purposeEnum = pgEnum("purpose", ["General", "Gaming", "Servidores", "Seguridad", "PCs Antiguos"]);
export const architectureEnum = pgEnum("architecture", ["64-bit", "ARM64", "32-bit"]);
export const roleEnum = pgEnum("role", ["user", "admin"]);

/**
 * Users table - stores authentication and user data
 */
export const users = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Distros table - stores Linux distribution information
 */
export const distros = pgTable("distros", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 64 }).notNull().default("General"),
  ramMin: bigint("ramMin", { mode: "number" }).notNull().default(512),
  difficulty: difficultyEnum("difficulty").notNull().default("Principiante"),
  purpose: purposeEnum("purpose").notNull().default("General"),
  architecture: architectureEnum("architecture").notNull().default("64-bit"),
  logoUrl: text("logoUrl"),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
});

export type Distro = typeof distros.$inferSelect;
export type InsertDistro = typeof distros.$inferInsert;
