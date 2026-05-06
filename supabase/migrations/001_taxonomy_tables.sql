-- Enum for status
CREATE TYPE taxonomy_status AS ENUM ('active', 'inactive', 'later');

-- Enum for launch priority
CREATE TYPE launch_priority AS ENUM ('P1', 'P2', 'P3', 'P4', 'out_of_scope');

-- Enum for region type
CREATE TYPE region_type AS ENUM ('ski_resort', 'rural_town', 'coastal', 'onsen_town', 'urban_access', 'mountain_village', 'lakeside');

-- Enum for use case priority
CREATE TYPE use_case_priority AS ENUM ('high', 'medium', 'low');

-- Enum for renovation category
CREATE TYPE renovation_category AS ENUM ('wet_areas', 'interior', 'exterior', 'maintenance_safety', 'comfort_performance', 'unique_to_japan');

-- Prefectures
CREATE TABLE prefectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description TEXT DEFAULT '',
  status taxonomy_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cities
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description TEXT DEFAULT '',
  status taxonomy_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  prefecture_id UUID NOT NULL REFERENCES prefectures(id),
  launch_priority launch_priority NOT NULL DEFAULT 'out_of_scope',
  region_type region_type,
  closest_airport TEXT,
  airport_time_min INT,
  closest_station TEXT,
  station_time_min INT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Property Types
CREATE TABLE property_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description TEXT DEFAULT '',
  status taxonomy_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  typical_use TEXT DEFAULT '',
  typical_regions TEXT DEFAULT '',
  price_range_text TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Use Cases
CREATE TABLE use_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description TEXT DEFAULT '',
  status taxonomy_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  target_buyers TEXT DEFAULT '',
  typical_property_types TEXT DEFAULT '',
  typical_regions TEXT DEFAULT '',
  priority use_case_priority NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Design Styles
CREATE TABLE design_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description TEXT DEFAULT '',
  status taxonomy_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  description_long TEXT DEFAULT '',
  key_features TEXT DEFAULT '',
  typical_regions TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Price Ranges
CREATE TABLE price_ranges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description TEXT DEFAULT '',
  status taxonomy_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  min_jpy BIGINT,
  max_jpy BIGINT,
  min_aud INT,
  max_aud INT,
  target_segment TEXT DEFAULT '',
  typical_property_types TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Renovation Features
CREATE TABLE renovation_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  description TEXT DEFAULT '',
  status taxonomy_status NOT NULL DEFAULT 'active',
  sort_order INT NOT NULL DEFAULT 0,
  category renovation_category NOT NULL,
  japan_specific BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Updated-at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all taxonomy tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON prefectures FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON cities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON property_types FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON use_cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON design_styles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON price_ranges FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON renovation_features FOR EACH ROW EXECUTE FUNCTION update_updated_at();
