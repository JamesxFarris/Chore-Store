import { supabaseAdmin } from "../lib/supabase.js";
import { hashPin } from "../lib/pin.js";
import { toCamel, toCamelArray } from "../lib/case-utils.js";
import { NotFoundError, ConflictError } from "../lib/errors.js";
import type { CreateChildInput, UpdateChildInput } from "@chore-store/shared";

const CHILD_SELECT = "id, name, avatar, household_id, created_at";

export async function createChild(
  householdId: string,
  input: CreateChildInput,
) {
  const { data: existing } = await supabaseAdmin
    .from("children")
    .select("id")
    .eq("household_id", householdId)
    .eq("name", input.name)
    .maybeSingle();

  if (existing) {
    throw new ConflictError("A child with that name already exists");
  }

  const pinHash = await hashPin(input.pin);
  const { data, error } = await supabaseAdmin
    .from("children")
    .insert({
      name: input.name,
      avatar: input.avatar ?? null,
      pin_hash: pinHash,
      household_id: householdId,
    })
    .select(CHILD_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return toCamel(data);
}

export async function getChildren(householdId: string) {
  const { data, error } = await supabaseAdmin
    .from("children")
    .select(CHILD_SELECT)
    .eq("household_id", householdId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return toCamelArray(data);
}

export async function getChild(id: string, householdId: string) {
  const { data } = await supabaseAdmin
    .from("children")
    .select(CHILD_SELECT)
    .eq("id", id)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!data) throw new NotFoundError("Child not found");
  return toCamel(data);
}

export async function updateChild(
  id: string,
  householdId: string,
  input: UpdateChildInput,
) {
  const { data: child } = await supabaseAdmin
    .from("children")
    .select("id")
    .eq("id", id)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!child) throw new NotFoundError("Child not found");

  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.avatar !== undefined) updates.avatar = input.avatar;
  if (input.pin !== undefined) updates.pin_hash = await hashPin(input.pin);

  const { data, error } = await supabaseAdmin
    .from("children")
    .update(updates)
    .eq("id", id)
    .select(CHILD_SELECT)
    .single();

  if (error) throw new Error(error.message);
  return toCamel(data);
}

export async function deleteChild(id: string, householdId: string) {
  const { data: child } = await supabaseAdmin
    .from("children")
    .select("id")
    .eq("id", id)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!child) throw new NotFoundError("Child not found");
  await supabaseAdmin.from("children").delete().eq("id", id);
}
