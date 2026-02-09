import crypto from "crypto";
import { supabaseAdmin } from "../lib/supabase.js";
import { toCamel } from "../lib/case-utils.js";
import { ConflictError, NotFoundError } from "../lib/errors.js";
import type { CreateHouseholdInput } from "@chore-store/shared";

function generateInviteCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function createHousehold(
  userId: string,
  input: CreateHouseholdInput,
) {
  const { data: existing } = await supabaseAdmin
    .from("household_members")
    .select("id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existing) {
    throw new ConflictError("You already belong to a household");
  }

  const { data: household, error } = await supabaseAdmin
    .from("households")
    .insert({ name: input.name, invite_code: generateInviteCode() })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Add the creator as a member
  await supabaseAdmin
    .from("household_members")
    .insert({ user_id: userId, household_id: household.id, role: "PARENT" });

  // Return household with members
  const { data: members } = await supabaseAdmin
    .from("household_members")
    .select("*")
    .eq("household_id", household.id);

  return toCamel({ ...household, members: members ?? [] });
}

export async function joinHousehold(userId: string, inviteCode: string) {
  const { data: household } = await supabaseAdmin
    .from("households")
    .select("*")
    .eq("invite_code", inviteCode)
    .maybeSingle();

  if (!household) {
    throw new NotFoundError("Household not found");
  }

  const { data: existing } = await supabaseAdmin
    .from("household_members")
    .select("id")
    .eq("user_id", userId)
    .eq("household_id", household.id)
    .maybeSingle();

  if (existing) {
    throw new ConflictError("Already a member of this household");
  }

  await supabaseAdmin
    .from("household_members")
    .insert({ user_id: userId, household_id: household.id, role: "PARENT" });

  return toCamel(household);
}

export async function getHousehold(householdId: string) {
  const { data: household } = await supabaseAdmin
    .from("households")
    .select("*")
    .eq("id", householdId)
    .maybeSingle();

  if (!household) throw new NotFoundError("Household not found");

  // Get members with profile info
  const { data: members } = await supabaseAdmin
    .from("household_members")
    .select("id, user_id, household_id, role")
    .eq("household_id", householdId);

  // Get profile info for each member
  const membersWithUser = await Promise.all(
    (members ?? []).map(async (m: any) => {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("name")
        .eq("id", m.user_id)
        .single();

      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(m.user_id);

      return {
        ...m,
        user: {
          id: m.user_id,
          name: profile?.name ?? "",
          email: authData?.user?.email ?? "",
        },
      };
    }),
  );

  // Get children
  const { data: children } = await supabaseAdmin
    .from("children")
    .select("id, name, avatar, created_at")
    .eq("household_id", householdId);

  return toCamel({
    ...household,
    members: membersWithUser,
    children: children ?? [],
  });
}
