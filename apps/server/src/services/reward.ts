import { supabaseAdmin } from "../lib/supabase.js";
import { toCamel, toCamelArray } from "../lib/case-utils.js";
import { NotFoundError } from "../lib/errors.js";
import type { CreateRewardInput, UpdateRewardInput } from "@chore-store/shared";

export async function createReward(
  householdId: string,
  input: CreateRewardInput,
) {
  const { data, error } = await supabaseAdmin
    .from("rewards")
    .insert({
      name: input.name,
      description: input.description ?? null,
      point_cost: input.pointCost,
      household_id: householdId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toCamel(data);
}

export async function getRewards(householdId: string) {
  const { data, error } = await supabaseAdmin
    .from("rewards")
    .select()
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return toCamelArray(data);
}

export async function getActiveRewards(householdId: string) {
  const { data, error } = await supabaseAdmin
    .from("rewards")
    .select()
    .eq("household_id", householdId)
    .eq("is_active", true)
    .order("point_cost", { ascending: true });

  if (error) throw new Error(error.message);
  return toCamelArray(data);
}

export async function updateReward(
  id: string,
  householdId: string,
  input: UpdateRewardInput,
) {
  const { data: reward } = await supabaseAdmin
    .from("rewards")
    .select("id")
    .eq("id", id)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!reward) throw new NotFoundError("Reward not found");

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;
  if (input.pointCost !== undefined) updates.point_cost = input.pointCost;
  if (input.isActive !== undefined) updates.is_active = input.isActive;

  const { data, error } = await supabaseAdmin
    .from("rewards")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toCamel(data);
}

export async function deleteReward(id: string, householdId: string) {
  const { data: reward } = await supabaseAdmin
    .from("rewards")
    .select("id")
    .eq("id", id)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!reward) throw new NotFoundError("Reward not found");
  await supabaseAdmin
    .from("rewards")
    .update({ is_active: false })
    .eq("id", id);
}
