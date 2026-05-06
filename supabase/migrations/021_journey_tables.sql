-- 021_journey_tables.sql
-- Decision-to-Living journey: state, signals, notes, bookmarks, OG cache.

-- =========================================
-- user_journey_state
-- =========================================
CREATE TABLE user_journey_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phase TEXT NOT NULL DEFAULT '0_trigger'
    CHECK (phase IN ('0_trigger','1_decision','2_budget','3_area','4_shortlist',
                     '5_due_diligence','6_offer','6_contract','7_pre_close',
                     '8_closing','9_move_in','10_living','x_meta')),
  buyer_type TEXT CHECK (buyer_type IN ('all','remote','seasonal','retirement')),
  phase_set_via TEXT NOT NULL DEFAULT 'inference'
    CHECK (phase_set_via IN ('inference','override')),
  phase_overridden_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_journey_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =========================================
-- journey_signals (append-only audit log)
-- =========================================
CREATE TABLE journey_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL,
  phase_before TEXT NOT NULL,
  phase_after TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_journey_signals_user_time
  ON journey_signals(user_id, captured_at DESC);
CREATE INDEX idx_journey_signals_type ON journey_signals(signal_type);

-- =========================================
-- journey_notes
-- =========================================
CREATE TABLE journey_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  phase TEXT NOT NULL,
  body TEXT NOT NULL CHECK (length(body) <= 20000),
  pinned BOOLEAN NOT NULL DEFAULT false,
  linked_property_slugs TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_journey_notes_user_phase
  ON journey_notes(user_id, phase, pinned DESC, created_at DESC);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON journey_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =========================================
-- journey_bookmarks (denormalized OG)
-- =========================================
CREATE TABLE journey_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL CHECK (url ~* '^https://'),
  url_canonical TEXT NOT NULL,
  url_hash TEXT NOT NULL,
  phase TEXT,
  linked_property_slugs TEXT[] NOT NULL DEFAULT '{}',
  user_note TEXT CHECK (length(user_note) <= 500),
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  og_favicon_url TEXT,
  og_site_name TEXT,
  og_fetched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_journey_bookmarks_user_url
  ON journey_bookmarks(user_id, url_hash);
CREATE INDEX idx_journey_bookmarks_user_phase
  ON journey_bookmarks(user_id, phase, created_at DESC);
CREATE TRIGGER set_updated_at BEFORE UPDATE ON journey_bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =========================================
-- og_cache (global, shared across users)
-- =========================================
CREATE TABLE og_cache (
  url_hash TEXT PRIMARY KEY,
  url_canonical TEXT NOT NULL,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  og_favicon_url TEXT,
  og_site_name TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  fetch_error TEXT,
  error_count INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_og_cache_expires ON og_cache(expires_at);

-- =========================================
-- RLS
-- =========================================
ALTER TABLE user_journey_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_signals    ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_notes      ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_bookmarks  ENABLE ROW LEVEL SECURITY;
ALTER TABLE og_cache           ENABLE ROW LEVEL SECURITY;

-- journey_state: own row read; updates via service role except for explicit override
CREATE POLICY "journey_state_read_own" ON user_journey_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "journey_state_override_own" ON user_journey_state
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (
    auth.uid() = user_id AND phase_set_via = 'override'
  );

-- journey_signals: own rows readable; inserts via service role only
CREATE POLICY "journey_signals_read_own" ON journey_signals
  FOR SELECT USING (auth.uid() = user_id);

-- journey_notes: full CRUD on own rows
CREATE POLICY "journey_notes_own" ON journey_notes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- journey_bookmarks: full CRUD on own rows
CREATE POLICY "journey_bookmarks_own" ON journey_bookmarks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- og_cache: public read; writes via service role only
CREATE POLICY "og_cache_public_read" ON og_cache
  FOR SELECT USING (true);
