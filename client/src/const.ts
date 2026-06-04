import { createClient } from "@supabase/supabase-js";

export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("⚠️ Variables de Supabase no detectadas en el entorno.");
}

// Cliente limpio conectado directamente con tu Supabase de producción
export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "");
