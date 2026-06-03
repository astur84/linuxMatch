import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const distros = mysqlTable("distros", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description").notNull().default(" "),
  category: varchar("category", { length: 64 }).notNull().default("General"),
  ramMin: int("ramMin").notNull().default(512),
  difficulty: mysqlEnum("difficulty", ["Principiante", "Intermedio", "Avanzado"]).notNull().default("Principiante"),
  purpose: mysqlEnum("purpose", ["General", "Gaming", "Servidores", "Seguridad", "PCs Antiguos"]).notNull().default("General"),
  architecture: mysqlEnum("architecture", ["64-bit", "ARM64", "32-bit"]).notNull().default("64-bit"),
  logoUrl: text("logoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Distro = typeof distros.$inferSelect;
export type InsertDistro = typeof distros.$inferInsert;
