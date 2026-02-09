import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function main() {
  console.log("Seeding database...");

  // Clean up existing data (order matters for FK constraints)
  await supabase.from("points_transactions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("redemptions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("verifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("submissions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("chore_instances").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("chore_templates").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("rewards").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("children").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("household_members").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("households").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Delete existing test users from auth
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  for (const user of existingUsers?.users ?? []) {
    if (user.email === "parent@example.com") {
      await supabase.auth.admin.deleteUser(user.id);
    }
  }

  // Create parent user via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: "parent@example.com",
    password: "password",
    email_confirm: true,
    user_metadata: { name: "Mom" },
  });

  if (authError) {
    console.error("Failed to create parent user:", authError.message);
    process.exit(1);
  }
  const parentId = authData.user.id;
  console.log(`Created parent: ${parentId}`);

  // Create household
  const { data: household, error: hErr } = await supabase
    .from("households")
    .insert({ name: "The Demo Family", invite_code: "DEMO1234" })
    .select()
    .single();

  if (hErr) {
    console.error("Failed to create household:", hErr.message);
    process.exit(1);
  }
  console.log(`Created household: ${household.id}`);

  // Add parent as household member
  await supabase
    .from("household_members")
    .insert({ user_id: parentId, household_id: household.id, role: "PARENT" });

  // Create children
  const pinHash = await bcrypt.hash("1234", 10);

  const { data: emma } = await supabase
    .from("children")
    .insert({ name: "Emma", pin_hash: pinHash, household_id: household.id })
    .select()
    .single();

  const { data: jack } = await supabase
    .from("children")
    .insert({ name: "Jack", pin_hash: pinHash, household_id: household.id })
    .select()
    .single();

  console.log(`Created children: Emma(${emma!.id}), Jack(${jack!.id})`);

  // Create chore templates
  const { data: makebed } = await supabase
    .from("chore_templates")
    .insert({
      title: "Make your bed",
      description: "Straighten sheets, fluff pillows",
      points: 5,
      recurrence: "DAILY",
      household_id: household.id,
    })
    .select()
    .single();

  const { data: dishes } = await supabase
    .from("chore_templates")
    .insert({
      title: "Do the dishes",
      description: "Wash, dry, and put away all dishes",
      points: 10,
      recurrence: "DAILY",
      household_id: household.id,
    })
    .select()
    .single();

  const { data: vacuum } = await supabase
    .from("chore_templates")
    .insert({
      title: "Vacuum living room",
      points: 15,
      recurrence: "WEEKLY",
      household_id: household.id,
    })
    .select()
    .single();

  const { data: homework } = await supabase
    .from("chore_templates")
    .insert({
      title: "Finish homework",
      description: "Complete all assigned homework",
      points: 20,
      recurrence: "NONE",
      household_id: household.id,
    })
    .select()
    .single();

  console.log("Created chore templates");

  // Create today's chore instances
  const today = new Date().toISOString().split("T")[0];

  for (const child of [emma!, jack!]) {
    for (const template of [makebed!, dishes!]) {
      await supabase.from("chore_instances").insert({
        template_id: template.id,
        assigned_child_id: child.id,
        due_date: today,
        status: "TODO",
      });
    }
  }

  // Assign vacuum to Emma
  await supabase.from("chore_instances").insert({
    template_id: vacuum!.id,
    assigned_child_id: emma!.id,
    due_date: today,
    status: "TODO",
  });

  // Assign homework to Jack
  await supabase.from("chore_instances").insert({
    template_id: homework!.id,
    assigned_child_id: jack!.id,
    due_date: today,
    status: "TODO",
  });

  console.log("Created chore instances");

  // Create rewards
  const rewards = [
    { name: "Extra Screen Time (30 min)", description: "30 minutes of extra screen time", point_cost: 25 },
    { name: "Pick Dinner", description: "Choose what's for dinner tonight", point_cost: 50 },
    { name: "Movie Night Pick", description: "Choose the family movie on Friday night", point_cost: 75 },
    { name: "$5 Allowance Bonus", description: "Extra $5 added to allowance", point_cost: 100 },
  ];

  for (const reward of rewards) {
    await supabase.from("rewards").insert({
      ...reward,
      household_id: household.id,
    });
  }

  console.log("Created rewards");
  console.log("\nSeed complete!");
  console.log("Parent login: parent@example.com / password");
  console.log("Child login: Code=DEMO1234, Name=Emma or Jack, PIN=1234");
}

main().catch(console.error);
