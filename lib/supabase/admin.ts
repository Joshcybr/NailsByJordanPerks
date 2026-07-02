import { createClient } from "@supabase/supabase-js";

// ⚠️ Service-role client — NEVER import this into a "use client" file or
// expose SUPABASE_SERVICE_ROLE_KEY with a NEXT_PUBLIC_ prefix. It bypasses
// Row Level Security entirely, which is exactly why it's the only thing
// allowed to mark a check-in token used and increment a client's visit count.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);