import { supabaseAdmin } from "../lib/supabase.js";
import { toCamel, toCamelArray } from "../lib/case-utils.js";
import { NotFoundError } from "../lib/errors.js";
import type {
  CreateChoreTemplateInput,
  UpdateChoreTemplateInput,
} from "@chore-store/shared";

export async function createChoreTemplate(
  householdId: string,
  input: CreateChoreTemplateInput,
) {
  const { data, error } = await supabaseAdmin
    .from("chore_templates")
    .insert({
      title: input.title,
      description: input.description ?? null,
      points: input.points,
      recurrence: input.recurrence,
      household_id: householdId,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toCamel(data);
}

export async function getChoreTemplates(householdId: string) {
  const { data, error } = await supabaseAdmin
    .from("chore_templates")
    .select()
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return toCamelArray(data);
}

export async function getChoreTemplate(id: string, householdId: string) {
  const { data } = await supabaseAdmin
    .from("chore_templates")
    .select()
    .eq("id", id)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!data) throw new NotFoundError("Chore template not found");
  return toCamel(data);
}

export async function updateChoreTemplate(
  id: string,
  householdId: string,
  input: UpdateChoreTemplateInput,
) {
  const { data: template } = await supabaseAdmin
    .from("chore_templates")
    .select("id")
    .eq("id", id)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!template) throw new NotFoundError("Chore template not found");

  const updates: Record<string, unknown> = {};
  if (input.title !== undefined) updates.title = input.title;
  if (input.description !== undefined) updates.description = input.description;
  if (input.points !== undefined) updates.points = input.points;
  if (input.recurrence !== undefined) updates.recurrence = input.recurrence;
  if (input.isActive !== undefined) updates.is_active = input.isActive;

  const { data, error } = await supabaseAdmin
    .from("chore_templates")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return toCamel(data);
}

export async function deleteChoreTemplate(id: string, householdId: string) {
  const { data: template } = await supabaseAdmin
    .from("chore_templates")
    .select("id")
    .eq("id", id)
    .eq("household_id", householdId)
    .maybeSingle();

  if (!template) throw new NotFoundError("Chore template not found");
  await supabaseAdmin
    .from("chore_templates")
    .update({ is_active: false })
    .eq("id", id);
}
