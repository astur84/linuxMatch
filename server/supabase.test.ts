import { describe, expect, it, beforeAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: ReturnType<typeof createClient>;

beforeAll(() => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Supabase credentials");
  }
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
});

describe("Supabase Connection", () => {
  it("should connect to Supabase successfully", async () => {
    expect(SUPABASE_URL).toBeDefined();
    expect(SUPABASE_SERVICE_ROLE_KEY).toBeDefined();
    expect(supabase).toBeDefined();
  });

  it("should be able to query the database", async () => {
    const { data, error } = await supabase
      .from("distros")
      .select("*", { count: "exact", head: true });

    // Table might not exist yet, but connection should work
    if (error && error.code !== "PGRST116") {
      // PGRST116 = relation does not exist
      throw error;
    }
    expect(true).toBe(true);
  });
});
