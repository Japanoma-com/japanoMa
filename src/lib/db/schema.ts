/**
 * Drizzle ORM Schema for Japanoma
 *
 * Maps all Supabase PostgreSQL tables, enums, and indexes.
 */
/* eslint-disable react-hooks/rules-of-hooks */
// Disabled: Drizzle's `useCasePriorityEnum` triggers the hooks lint rule
// because its name starts with "use". This file contains no React code.
import {
  pgTable,
  pgSchema,
  pgEnum,
  uuid,
  text,
  integer,
  bigint,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
  numeric,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Supabase auth schema — minimal mapping of auth.users so admin queries can
// join by user_id without resorting to raw SQL. We don't own this schema;
// the columns mapped here are read-only from the app's perspective.
// ---------------------------------------------------------------------------

const authSchema = pgSchema("auth");

export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
  email: text("email"),
  rawUserMetaData: jsonb("raw_user_meta_data"),
  rawAppMetaData: jsonb("raw_app_meta_data"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
  emailConfirmedAt: timestamp("email_confirmed_at", { withTimezone: true }),
});

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const taxonomyStatusEnum = pgEnum("taxonomy_status", [
  "active",
  "inactive",
  "later",
]);

export const launchPriorityEnum = pgEnum("launch_priority", [
  "P1",
  "P2",
  "P3",
  "P4",
  "out_of_scope",
]);

export const regionTypeEnum = pgEnum("region_type", [
  "ski_resort",
  "rural_town",
  "coastal",
  "onsen_town",
  "urban_access",
  "mountain_village",
  "lakeside",
]);

export const useCasePriorityEnum = pgEnum("use_case_priority", [
  "high",
  "medium",
  "low",
]);

export const renovationCategoryEnum = pgEnum("renovation_category", [
  "wet_areas",
  "interior",
  "exterior",
  "maintenance_safety",
  "comfort_performance",
  "unique_to_japan",
]);

export const contentPriorityEnum = pgEnum("content_priority", [
  "high",
  "medium",
  "low",
]);

export const eventTypeEnum = pgEnum("event_type", [
  // Core tracking (scope-boundaries F3)
  "page_view",
  "article_read",
  "quiz_start",
  "quiz_complete",
  "bookmark_add",
  "bookmark_remove",
  "compare_add",
  "compare_remove",
  "filter_apply",
  "contact_form",
  // Legacy / auxiliary
  "area_view",
  "property_type_view",
  "save",
  "unsave",
  "cta_click",
  "comparison_view",
]);

// ---------------------------------------------------------------------------
// Taxonomy tables
// ---------------------------------------------------------------------------

export const prefectures = pgTable("prefectures", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameJa: text("name_ja"),
  description: text("description"),
  status: taxonomyStatusEnum("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const cities = pgTable(
  "cities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    nameEn: text("name_en").notNull(),
    nameJa: text("name_ja"),
    description: text("description"),
    status: taxonomyStatusEnum("status").notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    prefectureId: uuid("prefecture_id")
      .notNull()
      .references(() => prefectures.id),
    launchPriority: launchPriorityEnum("launch_priority"),
    regionType: regionTypeEnum("region_type"),
    closestAirport: text("closest_airport"),
    airportTimeMin: integer("airport_time_min"),
    closestStation: text("closest_station"),
    stationTimeMin: integer("station_time_min"),
    notes: text("notes"),
    contentPriority: contentPriorityEnum("content_priority"),
    shuttleBus: boolean("shuttle_bus"),
    busToSlopeMin: integer("bus_to_slope_min"),
    carToSlopeMin: integer("car_to_slope_min"),
    // Added in migration 012 (CRA-76 taxonomy refresh) — AU buyer
    // enrichment fields surfaced on Area pages + Compare view.
    timeFromSydney: text("time_from_sydney"),
    timeFromMelbourne: text("time_from_melbourne"),
    timeFromBrisbane: text("time_from_brisbane"),
    timeFromPerth: text("time_from_perth"),
    timeFromAdelaide: text("time_from_adelaide"),
    avgPropertyPriceJpy: bigint("avg_property_price_jpy", { mode: "number" }),
    offSeasonActivitiesScore: integer("off_season_activities_score"),
    // Migration 014 — relative path to the hero image under /public/.
    heroImagePath: text("hero_image_path"),
    // Migration 015 — official town site (with municipality permission)
    // and population as of the CRA-76 25 Apr update.
    municipalityUrl: text("municipality_url"),
    population: integer("population"),
    // Migration 018 — town-centre coordinates for the 3D Japan map
    // view. numeric(9,6) gives ~11cm precision; stored as string
    // in JS via Drizzle's numeric type, parsed at the call site.
    latitude: numeric("latitude"),
    longitude: numeric("longitude"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_cities_prefecture").on(table.prefectureId),
    index("idx_cities_priority").on(table.launchPriority),
  ]
);

// Land & Building Details — non-quiz taxonomy introduced by CRA-76.
// Describes physical / legal attributes of individual listings
// (structure type, stories, land rights, zoning, etc.) as
// informational chips. 41 entries seeded in migration 013.
export const landBuildingDetails = pgTable(
  "land_building_details",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    category: text("category").notNull(),
    nameEn: text("name_en").notNull(),
    nameJa: text("name_ja"),
    description: text("description"),
    status: taxonomyStatusEnum("status").notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_land_building_details_category").on(table.category, table.sortOrder),
  ]
);

export const propertyTypes = pgTable("property_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameJa: text("name_ja"),
  description: text("description"),
  status: taxonomyStatusEnum("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  typicalUse: text("typical_use"),
  typicalRegions: text("typical_regions"),
  priceRangeText: text("price_range_text"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const useCases = pgTable("use_cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameJa: text("name_ja"),
  description: text("description"),
  status: taxonomyStatusEnum("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  targetBuyers: text("target_buyers"),
  typicalPropertyTypes: text("typical_property_types"),
  typicalRegions: text("typical_regions"),
  priority: useCasePriorityEnum("priority"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const designStyles = pgTable("design_styles", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameJa: text("name_ja"),
  description: text("description"),
  status: taxonomyStatusEnum("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  descriptionLong: text("description_long"),
  keyFeatures: text("key_features"),
  typicalRegions: text("typical_regions"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const priceRanges = pgTable("price_ranges", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameJa: text("name_ja"),
  description: text("description"),
  status: taxonomyStatusEnum("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  minJpy: bigint("min_jpy", { mode: "number" }),
  maxJpy: bigint("max_jpy", { mode: "number" }),
  minAud: integer("min_aud"),
  maxAud: integer("max_aud"),
  targetSegment: text("target_segment"),
  typicalPropertyTypes: text("typical_property_types"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const renovationFeatures = pgTable("renovation_features", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameJa: text("name_ja"),
  description: text("description"),
  status: taxonomyStatusEnum("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  category: renovationCategoryEnum("category"),
  japanSpecific: boolean("japan_specific").default(false),
  buyerRelevance: text("buyer_relevance"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Property Conditions
export const propertyConditions = pgTable("property_conditions", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameJa: text("name_ja"),
  description: text("description"),
  targetPersona: text("target_persona"),
  quizWeight: useCasePriorityEnum("quiz_weight").default("medium"),
  notes: text("notes"),
  status: taxonomyStatusEnum("status").notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Local Areas (3rd level under cities)
export const localAreas = pgTable(
  "local_areas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    nameEn: text("name_en").notNull(),
    nameJa: text("name_ja"),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id),
    regionType: regionTypeEnum("region_type"),
    notes: text("notes"),
    status: taxonomyStatusEnum("status").notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_local_areas_city").on(table.cityId),
    uniqueIndex("local_areas_city_slug").on(table.cityId, table.slug),
  ]
);

// ---------------------------------------------------------------------------
// User / App tables
// ---------------------------------------------------------------------------


export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull(),
    userId: uuid("user_id"),
    eventType: eventTypeEnum("event_type").notNull(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_events_session").on(table.sessionId),
    index("idx_events_type").on(table.eventType),
  ]
);

export const saves = pgTable(
  "saves",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id"),
    contentType: text("content_type").notNull(),
    contentId: text("content_id").notNull(),
    title: text("title"),
    href: text("href"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_saves_user").on(table.userId),
    uniqueIndex("saves_user_content_unique").on(
      table.userId,
      table.contentType,
      table.contentId
    ),
  ]
);

export const quizResponses = pgTable("quiz_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull(),
  userId: uuid("user_id"),
  quizType: text("quiz_type").notNull(),
  responses: jsonb("responses"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  consent: boolean("consent").notNull().default(false),
  source: text("source").default("direct"),
  sourceContext: jsonb("source_context"),
  leadStatus: text("lead_status").default("new"),
  userId: uuid("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Lead capture + consent
// ---------------------------------------------------------------------------

export const consentTextVersions = pgTable("consent_text_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  version: text("version").notNull().unique(),
  body: text("body").notNull(),
  bodyHash: text("body_hash").notNull(),
  scope: text("scope").notNull(),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull().defaultNow(),
  effectiveUntil: timestamp("effective_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const consentRecords = pgTable(
  "consent_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    consentTextVersion: text("consent_text_version")
      .notNull()
      .references(() => consentTextVersions.version),
    consentTextBody: text("consent_text_body").notNull(),
    consentTextHash: text("consent_text_hash").notNull(),
    scope: text("scope").notNull(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
    withdrawalReason: text("withdrawal_reason"),
  },
  (table) => [
    index("idx_consent_records_user").on(table.userId),
    index("idx_consent_records_captured_at").on(table.capturedAt),
  ]
);

export const followUpSurveys = pgTable(
  "follow_up_surveys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id"),
    token: text("token").notNull().unique(),
    recipientEmail: text("recipient_email").notNull(),
    recipientName: text("recipient_name"),
    context: jsonb("context"),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    responses: jsonb("responses"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_follow_up_surveys_lead").on(table.leadId),
    index("idx_follow_up_surveys_completed").on(table.completedAt),
  ]
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    consentRecordId: uuid("consent_record_id")
      .notNull()
      .references(() => consentRecords.id),
    areaSlug: text("area_slug").notNull(),
    prefectureSlug: text("prefecture_slug").notNull(),
    profileSnapshot: jsonb("profile_snapshot").notNull(),
    listingId: uuid("listing_id"), // FK deferred to v1.1
    status: text("status").notNull().default("new"),
    statusUpdatedAt: timestamp("status_updated_at", { withTimezone: true }).notNull().defaultNow(),
    katitasReference: text("katitas_reference"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
  },
  (table) => [
    index("idx_leads_user").on(table.userId),
    index("idx_leads_consent").on(table.consentRecordId),
  ]
);
