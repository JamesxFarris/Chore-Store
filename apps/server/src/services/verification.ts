import { supabaseAdmin } from "../lib/supabase.js";
import { toCamel, toCamelArray } from "../lib/case-utils.js";
import {
  BadRequestError,
  NotFoundError,
  ConflictError,
} from "../lib/errors.js";
import type { CreateVerificationInput } from "@chore-store/shared";

export async function getPendingVerifications(householdId: string) {
  const { data, error } = await supabaseAdmin
    .from("chore_instances")
    .select(`
      *,
      chore_templates!inner(*),
      children(id, name, avatar),
      submissions(*)
    `)
    .eq("status", "SUBMITTED")
    .eq("chore_templates.household_id", householdId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return toCamelArray(
    (data ?? []).map((row: any) => ({
      ...row,
      template: row.chore_templates,
      assignedChild: row.children ?? null,
      submission: row.submissions ?? null,
      chore_templates: undefined,
      children: undefined,
      submissions: undefined,
    })),
  );
}

export async function verify(
  choreInstanceId: string,
  parentId: string,
  householdId: string,
  input: CreateVerificationInput,
) {
  const { data: instance } = await supabaseAdmin
    .from("chore_instances")
    .select(`
      id, status, assigned_child_id,
      chore_templates(household_id, points, title),
      verifications(id)
    `)
    .eq("id", choreInstanceId)
    .maybeSingle();

  if (!instance) throw new NotFoundError("Chore instance not found");

  const template = instance.chore_templates as any;
  if (template.household_id !== householdId) {
    throw new NotFoundError("Chore instance not found");
  }
  if (instance.status !== "SUBMITTED") {
    throw new BadRequestError("This chore is not awaiting verification");
  }
  const verification = instance.verifications as any;
  if (verification && (Array.isArray(verification) ? verification.length > 0 : true)) {
    throw new ConflictError("This chore has already been verified");
  }

  const { data, error } = await supabaseAdmin.rpc("verify_chore", {
    p_chore_instance_id: choreInstanceId,
    p_parent_id: parentId,
    p_status: input.status,
    p_message: input.message ?? null,
    p_child_id: instance.assigned_child_id ?? null,
    p_points: template.points ?? 0,
    p_chore_title: template.title ?? "",
  });

  if (error) throw new Error(error.message);
  return toCamel(data);
}
