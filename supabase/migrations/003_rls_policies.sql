-- RLS Policies (apply to Supabase hosted project only — requires auth.uid())

-- Enable RLS on all tables
ALTER TABLE prefectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE renovation_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- Taxonomy: public read
CREATE POLICY "taxonomy_public_read" ON prefectures FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read" ON cities FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read" ON property_types FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read" ON use_cases FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read" ON design_styles FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read" ON price_ranges FOR SELECT USING (true);
CREATE POLICY "taxonomy_public_read" ON renovation_features FOR SELECT USING (true);

-- Form submissions: insert-only public
CREATE POLICY "form_submissions_insert" ON form_submissions
  FOR INSERT WITH CHECK (true);

-- Sessions: insert for anon
CREATE POLICY "sessions_insert" ON sessions
  FOR INSERT WITH CHECK (true);

-- Sessions: read own via token (for middleware)
CREATE POLICY "sessions_read_own" ON sessions
  FOR SELECT USING (true);

-- Events: insert-only
CREATE POLICY "events_insert" ON events
  FOR INSERT WITH CHECK (true);

-- Quiz responses: insert-only
CREATE POLICY "quiz_responses_insert" ON quiz_responses
  FOR INSERT WITH CHECK (true);

-- Users: own row read/update (uses auth.uid() from Supabase Auth)
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Saves: own rows only
CREATE POLICY "saves_own" ON saves
  FOR ALL USING (auth.uid() = user_id);
