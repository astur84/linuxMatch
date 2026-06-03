import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createDistro, deleteDistro, getDistroById, listDistros, updateDistro } from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

// ─── Admin guard middleware ───────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Solo los administradores pueden realizar esta acción." });
  }
  return next({ ctx });
});

// ─── Distro input schema ──────────────────────────────────────────────────────
const distroInput = z.object({
  name: z.string().min(1).max(128),
  description: z.string().min(1),
  category: z.string().min(1).max(64),
  ramMin: z.number().int().min(64).max(65536),
  difficulty: z.enum(["Principiante", "Intermedio", "Avanzado"]),
  purpose: z.enum(["General", "Gaming", "Servidores", "Seguridad", "PCs Antiguos"]),
  architecture: z.enum(["64-bit", "ARM64", "32-bit"]),
  logoUrl: z.string().url().optional().nullable(),
});

// ─── App router ───────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  distros: router({
    // ── Public: list with filters ──────────────────────────────────────────
    list: publicProcedure
      .input(
        z.object({
          search: z.string().optional(),
          ramMax: z.number().optional(),
          difficulty: z.string().optional(),
          purpose: z.string().optional(),
          architecture: z.string().optional(),
        }).optional()
      )
      .query(async ({ input }) => {
        return listDistros(input ?? {});
      }),

    // ── Public: get single distro ──────────────────────────────────────────
    getById: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .query(async ({ input }) => {
        const distro = await getDistroById(input.id);
        if (!distro) throw new TRPCError({ code: "NOT_FOUND", message: "Distribución no encontrada." });
        return distro;
      }),

    // ── Admin: create ──────────────────────────────────────────────────────
    create: adminProcedure
      .input(distroInput)
      .mutation(async ({ input }) => {
        await createDistro(input);
        return { success: true };
      }),

    // ── Admin: update ──────────────────────────────────────────────────────
    update: adminProcedure
      .input(z.object({ id: z.number().int() }).merge(distroInput))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const existing = await getDistroById(id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Distribución no encontrada." });
        await updateDistro(id, data);
        return { success: true };
      }),

    // ── Admin: delete ──────────────────────────────────────────────────────
    delete: adminProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        const existing = await getDistroById(input.id);
        if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Distribución no encontrada." });
        await deleteDistro(input.id);
        return { success: true };
      }),

    // ── Public: fetch description from Wikipedia ───────────────────────────
    fetchWikipedia: publicProcedure
      .input(z.object({ name: z.string().min(1) }))
      .mutation(async ({ input }) => {
        try {
          const encoded = encodeURIComponent(input.name);
          const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
          const res = await fetch(url);
          if (!res.ok) {
            // Try English Wikipedia as fallback
            const urlEn = `https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`;
            const resEn = await fetch(urlEn);
            if (!resEn.ok) return { description: "", found: false };
            const dataEn = await resEn.json();
            return { description: dataEn.extract ?? "", found: true };
          }
          const data = await res.json();
          return { description: data.extract ?? "", found: true };
        } catch {
          return { description: "", found: false };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
