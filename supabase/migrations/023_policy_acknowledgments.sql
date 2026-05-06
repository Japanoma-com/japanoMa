-- Policy acknowledgments — append-only audit log of every Terms &
-- Privacy acceptance. The user_id + doc_type + version triple is what
-- proves "this user, on this date, accepted version X of doc Y".
-- Records are kept indefinitely (legal protection); never deleted on
-- account deletion — we anonymise user_id to NULL via SET NULL on
-- cascade so the audit trail survives but is no longer linked to a
-- person.

CREATE TABLE IF NOT EXISTS public.policy_acknowledgments (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  doc_type        text NOT NULL CHECK (doc_type IN ('terms', 'privacy')),
  version         text NOT NULL,
  acknowledged_at timestamptz NOT NULL DEFAULT now(),
  ip_address      text,
  user_agent      text,
  context         text NOT NULL CHECK (context IN ('signup', 'reacknowledgment'))
);

COMMENT ON TABLE  public.policy_acknowledgments IS 'Append-only audit log of T&Cs and Privacy Policy acknowledgments. Retained indefinitely.';
COMMENT ON COLUMN public.policy_acknowledgments.user_id IS 'NULL after account deletion (audit trail survives, link to person does not).';
COMMENT ON COLUMN public.policy_acknowledgments.doc_type IS 'Either ''terms'' or ''privacy''.';
COMMENT ON COLUMN public.policy_acknowledgments.version IS 'Free-form version string e.g. "1.0" — must match what was rendered to the user at acknowledgment time.';
COMMENT ON COLUMN public.policy_acknowledgments.context IS 'How the acknowledgment was captured (signup or reacknowledgment after a version bump).';

-- Lookup index: most reads are "what's the latest acknowledgment for
-- this user and doc?", which becomes O(log n) with this index instead
-- of a full scan on every signin.
CREATE INDEX IF NOT EXISTS idx_policy_ack_user_doc_time
  ON public.policy_acknowledgments (user_id, doc_type, acknowledged_at DESC);

-- RLS: users can read their own acknowledgments; nobody can write
-- through the public API. Writes happen exclusively through the
-- service-role client in the signUp server action.
ALTER TABLE public.policy_acknowledgments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_ack"
  ON public.policy_acknowledgments
  FOR SELECT
  USING (auth.uid() = user_id);
