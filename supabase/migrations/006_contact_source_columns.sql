-- Migration: 006_contact_source_columns
-- Adds source tracking columns to form_submissions for quiz/area auto-population

ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'direct';
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS source_context JSONB;
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT 'new';
