import { createClient } from "@supabase/supabase-js";

// Exportamos constantes compartidas si las necesitas
export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("⚠️ Falta configurar las variables de entorno de Supabase en el cliente.");
}

// Cliente de Supabase para el frontend (usa la clave anon, NO la service_role)
export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "");
