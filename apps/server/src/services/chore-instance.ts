import { supabaseAdmin } from "../lib/supabase.js";
import { toCamel, toCamelArray } from "../lib/case-utils.js";
import { NotFoundError } from "../lib/errors.js";

function todayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * Generate recurring chore instances for today.
 * Called lazily on dashboard load or child chore query.
 */
export async function generateInstances(
  householdId: string,
  childId?: string,
) {
  const today = todayDate();

  const { data: templates } = await supabaseAdmin
    .from("chore_templates")
    .select()
    .eq("household_id", householdId)
    .eq("is_active", true)
    .neq("recurrence", "NONE");

  let childQuery = supabaseAdmin
    .from("children")
    .select("id")
    .eq("household_id", householdId);
  if (childId) {
    childQuery = childQuery.eq("id", childId);
  }
  const { data: children } = await childQuery;

  for (const template of templates ?? []) {
    for (const child of children ?? []) {
      await supabaseAdmin.rpc("upsert_chore_instance", {
        p_template_id: template.id,
        p_assigned_child_id: child.id,
        p_due_date: today,
      });
    }
  }
}

export async function getInstancesForChild(
  childId: string,
  date?: string,
) {
  const dueDate = date ?? todayDate();

  const { data, error } = await supabaseAdmin
    .from("chore_instances")
    .select(`
      *,
      chore_templates(*),
      submissions(*),
      verifications(*)
    `)
    .eq("assigned_child_id", childId)
    .eq("due_date", dueDate)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  // Reshape to match Prisma's include format
  return toCamelArray(
    (data ?? []).map((row: any) => ({
      ...row,
      template: row.chore_templates,
      submission: row.submissions ?? null,
      verification: row.verifications ?? null,
      chore_templates: undefined,
      submissions: undefined,
      verifications: undefined,
    })),
  );
}

export async function getInstancesForHousehold(
  householdId: string,
  date?: string,
) {
  const dueDate = date ?? todayDate();

  const { data, error } = await supabaseAdmin
    .from("chore_instances")
    .select(`
      *,
      chore_templates!inner(*),
      children(id, name, avatar),
      submissions(*),
      verifications(*)
    `)
    .eq("chore_templates.household_id", householdId)
    .eq("due_date", dueDate)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return toCamelArray(
    (data ?? []).map((row: any) => ({
      ...row,
      template: row.chore_templates,
      assignedChild: row.children ?? null,
      submission: row.submissions ?? null,
      verification: row.verifications ?? null,
      chore_templates: undefined,
      children: undefined,
      submissions: undefined,
      verifications: undefined,
    })),
  );
}

export async function createOneTimeInstance(
  templateId: string,
  childId: string,
  dueDate?: string,
) {
  const date = dueDate ?? todayDate();

  const { data, error } = await supabaseAdmin
    .from("chore_instances")
    .insert({
      template_id: templateId,
      assigned_child_id: childId,
      due_date: date,
      status: "TODO",
    })
    .select(`*, chore_templates(*)`)
    .single();

  if (error) throw new Error(error.message);

  return toCamel({
    ...data,
    template: data.chore_templates,
    chore_templates: undefined,
  });
}

export async function getInstance(id: string) {
  const { data } = await supabaseAdmin
    .from("chore_instances")
    .select(`
      *,
      chore_templates(*),
      children(id, name, avatar),
      submissions(*),
      verifications(*)
    `)
    .eq("id", id)
    .maybeSingle();

  if (!data) throw new NotFoundError("Chore instance not found");

  return toCamel({
    ...data,
    template: data.chore_templates,
    assignedChild: data.children ?? null,
    submission: data.submissions ?? null,
    verification: data.verifications ?? null,
    chore_templates: undefined,
    children: undefined,
    submissions: undefined,
    verifications: undefined,
  });
}
