-- ============================================================
-- Chore Store: Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up the database
-- ============================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on profiles" ON profiles FOR ALL USING (true);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. HOUSEHOLDS
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on households" ON households FOR ALL USING (true);

-- 3. HOUSEHOLD MEMBERS
CREATE TABLE IF NOT EXISTS household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'PARENT',
  UNIQUE(user_id, household_id)
);
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on household_members" ON household_members FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_household_members_user_id ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_household_members_household_id ON household_members(household_id);

-- 4. CHILDREN
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT,
  pin_hash TEXT NOT NULL,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(household_id, name)
);
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on children" ON children FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_children_household_id ON children(household_id);

-- 5. CHORE TEMPLATES
CREATE TABLE IF NOT EXISTS chore_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  recurrence TEXT NOT NULL DEFAULT 'NONE',
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE chore_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on chore_templates" ON chore_templates FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_chore_templates_household_id ON chore_templates(household_id);

-- 6. CHORE INSTANCES
CREATE TABLE IF NOT EXISTS chore_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES chore_templates(id) ON DELETE CASCADE,
  assigned_child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'TODO',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(template_id, due_date, assigned_child_id)
);
ALTER TABLE chore_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on chore_instances" ON chore_instances FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_chore_instances_template_id ON chore_instances(template_id);
CREATE INDEX IF NOT EXISTS idx_chore_instances_assigned_child_id ON chore_instances(assigned_child_id);
CREATE INDEX IF NOT EXISTS idx_chore_instances_due_date ON chore_instances(due_date);

-- 7. SUBMISSIONS
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chore_instance_id UUID NOT NULL UNIQUE REFERENCES chore_instances(id) ON DELETE CASCADE,
  note TEXT,
  photo_url TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on submissions" ON submissions FOR ALL USING (true);

-- 8. VERIFICATIONS
CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chore_instance_id UUID NOT NULL UNIQUE REFERENCES chore_instances(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES auth.users(id),
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on verifications" ON verifications FOR ALL USING (true);

-- 9. REWARDS
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  point_cost INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on rewards" ON rewards FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_rewards_household_id ON rewards(household_id);

-- 10. REDEMPTIONS
CREATE TABLE IF NOT EXISTS redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'REQUESTED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on redemptions" ON redemptions FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_redemptions_child_id ON redemptions(child_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_reward_id ON redemptions(reward_id);

-- 11. POINTS TRANSACTIONS
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  chore_instance_id UUID REFERENCES chore_instances(id) ON DELETE SET NULL,
  redemption_id UUID REFERENCES redemptions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on points_transactions" ON points_transactions FOR ALL USING (true);
CREATE INDEX IF NOT EXISTS idx_points_transactions_child_id ON points_transactions(child_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_chore_instance_id ON points_transactions(chore_instance_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_redemption_id ON points_transactions(redemption_id);


-- ============================================================
-- RPC FUNCTIONS
-- ============================================================

-- 1. submit_chore: atomic create submission + update instance status
CREATE OR REPLACE FUNCTION submit_chore(
  p_chore_instance_id UUID,
  p_note TEXT DEFAULT NULL,
  p_photo_url TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_submission RECORD;
BEGIN
  INSERT INTO submissions (chore_instance_id, note, photo_url)
  VALUES (p_chore_instance_id, p_note, p_photo_url)
  RETURNING * INTO v_submission;

  UPDATE chore_instances SET status = 'SUBMITTED'
  WHERE id = p_chore_instance_id;

  RETURN row_to_json(v_submission);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. verify_chore: atomic create verification + update status + optionally award points
CREATE OR REPLACE FUNCTION verify_chore(
  p_chore_instance_id UUID,
  p_parent_id UUID,
  p_status TEXT,
  p_message TEXT DEFAULT NULL,
  p_child_id UUID DEFAULT NULL,
  p_points INTEGER DEFAULT 0,
  p_chore_title TEXT DEFAULT ''
)
RETURNS JSON AS $$
DECLARE
  v_verification RECORD;
BEGIN
  INSERT INTO verifications (chore_instance_id, parent_id, status, message)
  VALUES (p_chore_instance_id, p_parent_id, p_status, p_message)
  RETURNING * INTO v_verification;

  UPDATE chore_instances SET status = p_status
  WHERE id = p_chore_instance_id;

  IF p_status = 'APPROVED' AND p_child_id IS NOT NULL AND p_points > 0 THEN
    INSERT INTO points_transactions (child_id, amount, type, reason, chore_instance_id)
    VALUES (p_child_id, p_points, 'EARNED', 'Completed: ' || p_chore_title, p_chore_instance_id);
  END IF;

  RETURN row_to_json(v_verification);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. create_redemption: atomic create redemption + deduct points
CREATE OR REPLACE FUNCTION create_redemption(
  p_child_id UUID,
  p_reward_id UUID,
  p_reward_name TEXT,
  p_point_cost INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_redemption RECORD;
  v_transaction RECORD;
BEGIN
  INSERT INTO redemptions (child_id, reward_id, status)
  VALUES (p_child_id, p_reward_id, 'REQUESTED')
  RETURNING * INTO v_redemption;

  INSERT INTO points_transactions (child_id, amount, type, reason, redemption_id)
  VALUES (p_child_id, -p_point_cost, 'SPENT', 'Redeemed: ' || p_reward_name, v_redemption.id)
  RETURNING * INTO v_transaction;

  RETURN row_to_json(v_redemption);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. upsert_chore_instance: ON CONFLICT DO NOTHING for recurring chore generation
CREATE OR REPLACE FUNCTION upsert_chore_instance(
  p_template_id UUID,
  p_assigned_child_id UUID,
  p_due_date DATE
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO chore_instances (template_id, assigned_child_id, due_date, status)
  VALUES (p_template_id, p_assigned_child_id, p_due_date, 'TODO')
  ON CONFLICT (template_id, due_date, assigned_child_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. get_child_balance: SUM of points_transactions for a child
CREATE OR REPLACE FUNCTION get_child_balance(p_child_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_balance
  FROM points_transactions
  WHERE child_id = p_child_id;

  RETURN v_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
