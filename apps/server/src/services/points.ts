import { supabaseAdmin } from "../lib/supabase.js";
import { toCamelArray } from "../lib/case-utils.js";

export async function getBalance(childId: string): Promise<number> {
  const { data, error } = await supabaseAdmin.rpc("get_child_balance", {
    p_child_id: childId,
  });

  if (error) throw new Error(error.message);
  return data ?? 0;
}

export async function getTransactions(childId: string) {
  const { data, error } = await supabaseAdmin
    .from("points_transactions")
    .select()
    .eq("child_id", childId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return toCamelArray(data);
}
