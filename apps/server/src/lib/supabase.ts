import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/** Service-role client — bypasses RLS. Use for all server-side data access. */
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

/** Anon-key client — used only for Supabase Auth sign-up / sign-in. */
export const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
