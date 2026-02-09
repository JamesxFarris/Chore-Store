import { supabaseAdmin } from "../lib/supabase.js";
import { toCamel, toCamelArray } from "../lib/case-utils.js";
import { BadRequestError, NotFoundError } from "../lib/errors.js";
import { getBalance } from "./points.js";
import type { UpdateRedemptionStatusInput } from "@chore-store/shared";

export async function createRedemption(childId: string, rewardId: string) {
  const { data: reward } = await supabaseAdmin
    .from("rewards")
    .select()
    .eq("id", rewardId)
    .maybeSingle();

  if (!reward || !reward.is_active) {
    throw new NotFoundError("Reward not found");
  }

  const balance = await getBalance(childId);
  if (balance < reward.point_cost) {
    throw new BadRequestError("Insufficient points");
  }

  const { data, error } = await supabaseAdmin.rpc("create_redemption", {
    p_child_id: childId,
    p_reward_id: rewardId,
    p_reward_name: reward.name,
    p_point_cost: reward.point_cost,
  });

  if (error) throw new Error(error.message);
  return toCamel(data);
}

export async function getRedemptionsForChild(childId: string) {
  const { data, error } = await supabaseAdmin
    .from("redemptions")
    .select(`*, rewards(*)`)
    .eq("child_id", childId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return toCamelArray(
    (data ?? []).map((row: any) => ({
      ...row,
      reward: row.rewards,
      rewards: undefined,
    })),
  );
}

export async function getRedemptionsForHousehold(householdId: string) {
  const { data, error } = await supabaseAdmin
    .from("redemptions")
    .select(`
      *,
      rewards(*),
      children!inner(id, name, avatar, household_id)
    `)
    .eq("children.household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return toCamelArray(
    (data ?? []).map((row: any) => ({
      ...row,
      reward: row.rewards,
      child: row.children
        ? { id: row.children.id, name: row.children.name, avatar: row.children.avatar }
        : null,
      rewards: undefined,
      children: undefined,
    })),
  );
}

export async function updateRedemptionStatus(
  id: string,
  householdId: string,
  input: UpdateRedemptionStatusInput,
) {
  // Verify the redemption belongs to this household via child
  const { data: redemption } = await supabaseAdmin
    .from("redemptions")
    .select(`id, children!inner(household_id)`)
    .eq("id", id)
    .eq("children.household_id", householdId)
    .maybeSingle();

  if (!redemption) throw new NotFoundError("Redemption not found");

  const { data, error } = await supabaseAdmin
    .from("redemptions")
    .update({ status: input.status })
    .eq("id", id)
    .select(`*, rewards(*)`)
    .single();

  if (error) throw new Error(error.message);

  return toCamel({
    ...data,
    reward: (data as any).rewards,
    rewards: undefined,
  });
}
