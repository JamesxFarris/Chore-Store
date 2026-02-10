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

  // Get members with profile info in a single joined query
  const { data: members } = await supabaseAdmin
    .from("household_members")
    .select("id, user_id, household_id, role, profiles(name)")
    .eq("household_id", householdId);

  const memberUserIds = (members ?? []).map((m: any) => m.user_id);

  // Batch fetch auth users with listUsers (single call instead of N getUserById calls)
  const emailMap: Record<string, string> = {};
  if (memberUserIds.length > 0) {
    const { data: authData } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 50,
    });
    if (authData?.users) {
      for (const u of authData.users) {
        if (memberUserIds.includes(u.id)) {
          emailMap[u.id] = u.email ?? "";
        }
      }
    }
  }

  const membersWithUser = (members ?? []).map((m: any) => {
    const profileName = Array.isArray(m.profiles)
      ? m.profiles[0]?.name ?? ""
      : m.profiles?.name ?? "";
    return {
      id: m.id,
      user_id: m.user_id,
      household_id: m.household_id,
      role: m.role,
      user: {
        id: m.user_id,
        name: profileName,
        email: emailMap[m.user_id] ?? "",
      },
    };
  });

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
