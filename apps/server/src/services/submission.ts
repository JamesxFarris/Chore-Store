import { supabaseAdmin } from "../lib/supabase.js";
import { toCamel } from "../lib/case-utils.js";
import { BadRequestError, NotFoundError, ForbiddenError } from "../lib/errors.js";
import type { CreateSubmissionInput } from "@chore-store/shared";

export async function createSubmission(
  choreInstanceId: string,
  childId: string,
  input: CreateSubmissionInput,
) {
  const { data: instance } = await supabaseAdmin
    .from("chore_instances")
    .select("id, assigned_child_id, status")
    .eq("id", choreInstanceId)
    .maybeSingle();

  if (!instance) throw new NotFoundError("Chore instance not found");
  if (instance.assigned_child_id !== childId) {
    throw new ForbiddenError("This chore is not assigned to you");
  }
  if (instance.status !== "TODO") {
    throw new BadRequestError("This chore has already been submitted");
  }

  const { data, error } = await supabaseAdmin.rpc("submit_chore", {
    p_chore_instance_id: choreInstanceId,
    p_note: input.note ?? null,
    p_photo_url: input.photoUrl ?? null,
  });

  if (error) throw new Error(error.message);
  return toCamel(data);
}
