import { supabaseAdmin, supabaseAuth } from "../lib/supabase.js";
import { verifyPin } from "../lib/pin.js";
import { signToken } from "../lib/jwt.js";
import { toCamel } from "../lib/case-utils.js";
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from "../lib/errors.js";
import type { RegisterInput, LoginInput, ChildLoginInput } from "@chore-store/shared";

export async function register(input: RegisterInput) {
  // Use admin API to create a confirmed user (skips email confirmation)
  const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    user_metadata: { name: input.name },
    email_confirm: true,
  });

  if (createError) {
    if (createError.message.includes("already been registered")) {
      throw new ConflictError("Email already registered");
    }
    throw new Error(createError.message);
  }

  // Sign in to get a session token
  const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (signInError) {
    throw new Error(signInError.message);
  }

  return {
    token: signInData.session.access_token,
    user: {
      id: createData.user.id,
      email: createData.user.email!,
      name: input.name,
    },
  };
}

export async function login(input: LoginInput) {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const user = data.user;
  const token = data.session.access_token;

  // Get name from profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  return {
    token,
    user: {
      id: user.id,
      email: user.email!,
      name: profile?.name ?? "",
    },
  };
}

export async function childLogin(input: ChildLoginInput) {
  const { data: household, error: hErr } = await supabaseAdmin
    .from("households")
    .select("id")
    .eq("invite_code", input.householdCode)
    .maybeSingle();

  if (hErr || !household) {
    throw new NotFoundError("Household not found");
  }

  const { data: child, error: cErr } = await supabaseAdmin
    .from("children")
    .select("id, name, avatar, pin_hash, household_id")
    .eq("household_id", household.id)
    .eq("name", input.childName)
    .maybeSingle();

  if (cErr || !child) {
    throw new NotFoundError("Child not found");
  }

  const valid = await verifyPin(input.pin, child.pin_hash);
  if (!valid) {
    throw new UnauthorizedError("Invalid PIN");
  }

  const token = signToken({
    sub: child.id,
    type: "child",
    householdId: child.household_id,
  });

  return {
    token,
    child: {
      id: child.id,
      name: child.name,
      avatar: child.avatar,
      householdId: child.household_id,
    },
  };
}

export async function getMe(userId: string) {
  // Get profile
  const { data: profile, error: pErr } = await supabaseAdmin
    .from("profiles")
    .select("name")
    .eq("id", userId)
    .single();

  if (pErr || !profile) throw new NotFoundError("User not found");

  // Get email from auth
  const { data: authData, error: aErr } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (aErr || !authData.user) throw new NotFoundError("User not found");

  // Get household memberships
  const { data: memberships } = await supabaseAdmin
    .from("household_members")
    .select("role, household_id, households(id, name, invite_code)")
    .eq("user_id", userId);

  return {
    id: userId,
    email: authData.user.email!,
    name: profile.name,
    households: (memberships ?? []).map((m: any) => ({
      id: m.households.id,
      name: m.households.name,
      inviteCode: m.households.invite_code,
      role: m.role,
    })),
  };
}
