import { sql, and, gte, lte, eq, isNotNull, count, desc, inArray } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';
import {
  events,
  quizResponses,
  formSubmissions,
  leads,
  saves,
  authUsers,
} from '@/lib/db/schema';

/**
 * Admin dashboard read-side queries.
 *
 * Design notes
 * ------------
 * 1. Every query takes a {from, to} date range. Ranges come from URL
 *    search params so admin views share links.
 * 2. Expensive aggregations are wrapped in `unstable_cache` with a
 *    60-second revalidate. Admin data is inherently stale-tolerant; a
 *    one-minute cache turns busy dashboards from "hot SQL per request"
 *    into "hot SQL per minute per range".
 * 3. Indexes added in migration 011 make the underlying queries fast
 *    (see that file for before/after numbers). The cache layer here
 *    sits on top of that — defense in depth.
 * 4. `revalidateTag('admin')` from a mutation would bust every cached
 *    admin query at once, but leads/forms/events are append-only in
 *    MVP so we rely on the 60s TTL instead.
 */

export type DateRange = { from: Date; to: Date };

export function defaultRange(days = 30): DateRange {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  return { from, to };
}

/** Generate a stable cache key fragment from a date range. */
function rangeKey({ from, to }: DateRange): string {
  return `${from.toISOString()}_${to.toISOString()}`;
}

const CACHE_TTL = 60;
const TAG = 'admin';

// -------- Overview --------

export const getOverviewStats = (range: DateRange) =>
  unstable_cache(
    async () => {
      const { from, to } = range;
      const [
        [eventTotal],
        [uniqueSessions],
        [quizCompletions],
        [formSubmissionCount],
        [leadCount],
        [saveCount],
      ] = await Promise.all([
        db
          .select({ c: count() })
          .from(events)
          .where(and(gte(events.createdAt, from), lte(events.createdAt, to))),
        db
          .select({ c: sql<number>`count(distinct ${events.sessionId})` })
          .from(events)
          .where(and(gte(events.createdAt, from), lte(events.createdAt, to))),
        db
          .select({ c: count() })
          .from(events)
          .where(
            and(
              eq(events.eventType, 'quiz_complete'),
              gte(events.createdAt, from),
              lte(events.createdAt, to)
            )
          ),
        db
          .select({ c: count() })
          .from(formSubmissions)
          .where(and(gte(formSubmissions.createdAt, from), lte(formSubmissions.createdAt, to))),
        db
          .select({ c: count() })
          .from(leads)
          .where(and(gte(leads.createdAt, from), lte(leads.createdAt, to))),
        db
          .select({ c: count() })
          .from(saves)
          .where(and(gte(saves.createdAt, from), lte(saves.createdAt, to))),
      ]);

      return {
        totalEvents: Number(eventTotal?.c ?? 0),
        uniqueSessions: Number(uniqueSessions?.c ?? 0),
        quizCompletions: Number(quizCompletions?.c ?? 0),
        formSubmissions: Number(formSubmissionCount?.c ?? 0),
        leads: Number(leadCount?.c ?? 0),
        saves: Number(saveCount?.c ?? 0),
      };
    },
    ['admin.overviewStats', rangeKey(range)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

export const getEventsByTypeBreakdown = (range: DateRange) =>
  unstable_cache(
    async () => {
      const { from, to } = range;
      const rows = await db
        .select({
          eventType: events.eventType,
          total: count(),
        })
        .from(events)
        .where(and(gte(events.createdAt, from), lte(events.createdAt, to)))
        .groupBy(events.eventType)
        .orderBy(desc(count()));

      return rows.map((r) => ({ eventType: r.eventType, total: Number(r.total) }));
    },
    ['admin.eventsByType', rangeKey(range)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

export const getDailyEventTrend = (range: DateRange) =>
  unstable_cache(
    async () => {
      const { from, to } = range;
      const rows = await db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${events.createdAt}), 'YYYY-MM-DD')`,
          total: count(),
        })
        .from(events)
        .where(and(gte(events.createdAt, from), lte(events.createdAt, to)))
        .groupBy(sql`date_trunc('day', ${events.createdAt})`)
        .orderBy(sql`date_trunc('day', ${events.createdAt})`);

      return rows.map((r) => ({ day: r.day, total: Number(r.total) }));
    },
    ['admin.dailyEventTrend', rangeKey(range)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

/**
 * Per-metric daily series — one query that returns counts for each KPI
 * bucket per day, for sparkline rendering on the Overview. One DB round
 * trip instead of N.
 */
export const getDailyMetricSeries = (range: DateRange) =>
  unstable_cache(
    async () => {
      const { from, to } = range;
      const rows = await db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${events.createdAt}), 'YYYY-MM-DD')`,
          eventType: events.eventType,
          total: count(),
        })
        .from(events)
        .where(and(gte(events.createdAt, from), lte(events.createdAt, to)))
        .groupBy(sql`date_trunc('day', ${events.createdAt})`, events.eventType)
        .orderBy(sql`date_trunc('day', ${events.createdAt})`);

      // Pivot into per-day buckets keyed by event type
      const days = new Map<string, Record<string, number>>();
      for (const r of rows) {
        if (!days.has(r.day)) days.set(r.day, {});
        days.get(r.day)![r.eventType] = Number(r.total);
      }

      const series = Array.from(days.entries())
        .map(([day, counts]) => ({ day, ...counts }))
        .sort((a, b) => a.day.localeCompare(b.day));

      // Helper to extract a single-metric array for sparklines
      const extract = (key: string): number[] =>
        series.map((d) => ((d as Record<string, number | string>)[key] as number) ?? 0);

      return {
        series,
        sessions: extract('page_view'),
        quizStarts: extract('quiz_start'),
        quizCompletes: extract('quiz_complete'),
        bookmarks: extract('bookmark_add'),
        contacts: extract('contact_form'),
      };
    },
    ['admin.dailyMetricSeries', rangeKey(range)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

// -------- Event Timeline --------

export const getEventTimeline = (range: DateRange) =>
  unstable_cache(
    async () => {
      const { from, to } = range;
      const rows = await db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${events.createdAt}), 'YYYY-MM-DD')`,
          eventType: events.eventType,
          total: count(),
        })
        .from(events)
        .where(and(gte(events.createdAt, from), lte(events.createdAt, to)))
        .groupBy(sql`date_trunc('day', ${events.createdAt})`, events.eventType)
        .orderBy(sql`date_trunc('day', ${events.createdAt})`);

      const byDay = new Map<string, Record<string, string | number>>();
      const typesSeen = new Set<string>();

      for (const row of rows) {
        if (!byDay.has(row.day)) byDay.set(row.day, { day: row.day });
        byDay.get(row.day)![row.eventType] = Number(row.total);
        typesSeen.add(row.eventType);
      }

      for (const entry of byDay.values()) {
        for (const t of typesSeen) if (!(t in entry)) entry[t] = 0;
      }

      return {
        series: Array.from(typesSeen).sort(),
        data: Array.from(byDay.values()),
      };
    },
    ['admin.eventTimeline', rangeKey(range)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

// -------- Area Interest --------

export const getAreaInterest = (range: DateRange, limit = 30) =>
  unstable_cache(
    async () => {
      const { from, to } = range;

      const [leadRows, saveRows] = await Promise.all([
        db
          .select({
            areaSlug: leads.areaSlug,
            prefectureSlug: leads.prefectureSlug,
            count: count(),
          })
          .from(leads)
          .where(and(gte(leads.createdAt, from), lte(leads.createdAt, to)))
          .groupBy(leads.areaSlug, leads.prefectureSlug),
        db
          .select({
            contentId: saves.contentId,
            count: count(),
          })
          .from(saves)
          .where(
            and(
              eq(saves.contentType, 'city'),
              gte(saves.createdAt, from),
              lte(saves.createdAt, to)
            )
          )
          .groupBy(saves.contentId),
      ]);

      const merged = new Map<
        string,
        { areaSlug: string; prefectureSlug: string | null; leadCount: number; saveCount: number }
      >();

      for (const l of leadRows) {
        merged.set(l.areaSlug, {
          areaSlug: l.areaSlug,
          prefectureSlug: l.prefectureSlug,
          leadCount: Number(l.count),
          saveCount: 0,
        });
      }
      for (const s of saveRows) {
        const existing = merged.get(s.contentId);
        if (existing) {
          existing.saveCount = Number(s.count);
        } else {
          merged.set(s.contentId, {
            areaSlug: s.contentId,
            prefectureSlug: null,
            leadCount: 0,
            saveCount: Number(s.count),
          });
        }
      }

      return Array.from(merged.values())
        .sort((a, b) => {
          const scoreA = a.leadCount * 3 + a.saveCount;
          const scoreB = b.leadCount * 3 + b.saveCount;
          return scoreB - scoreA;
        })
        .slice(0, limit);
    },
    ['admin.areaInterest', rangeKey(range), String(limit)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

// -------- Content Performance --------

export const getTopArticles = (range: DateRange, limit = 20) =>
  unstable_cache(
    async () => {
      const { from, to } = range;
      const rows = await db
        .select({
          slug: sql<string>`${events.payload}->>'slug'`,
          title: sql<string>`${events.payload}->>'title'`,
          reads: count(),
        })
        .from(events)
        .where(
          and(
            eq(events.eventType, 'article_read'),
            isNotNull(sql`${events.payload}->>'slug'`),
            gte(events.createdAt, from),
            lte(events.createdAt, to)
          )
        )
        .groupBy(sql`${events.payload}->>'slug'`, sql`${events.payload}->>'title'`)
        .orderBy(desc(count()))
        .limit(limit);

      return rows.map((r) => ({ slug: r.slug, title: r.title, reads: Number(r.reads) }));
    },
    ['admin.topArticles', rangeKey(range), String(limit)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

// -------- Quiz funnel --------

export const getQuizFunnel = (range: DateRange) =>
  unstable_cache(
    async () => {
      const { from, to } = range;
      const [[starts], [completes], [responses]] = await Promise.all([
        db
          .select({ c: count() })
          .from(events)
          .where(
            and(
              eq(events.eventType, 'quiz_start'),
              gte(events.createdAt, from),
              lte(events.createdAt, to)
            )
          ),
        db
          .select({ c: count() })
          .from(events)
          .where(
            and(
              eq(events.eventType, 'quiz_complete'),
              gte(events.createdAt, from),
              lte(events.createdAt, to)
            )
          ),
        db
          .select({ c: count() })
          .from(quizResponses)
          .where(and(gte(quizResponses.createdAt, from), lte(quizResponses.createdAt, to))),
      ]);

      const startCount = Number(starts?.c ?? 0);
      const completeCount = Number(completes?.c ?? 0);

      return {
        starts: startCount,
        completes: completeCount,
        storedResponses: Number(responses?.c ?? 0),
        completionRate: startCount > 0 ? completeCount / startCount : 0,
      };
    },
    ['admin.quizFunnel', rangeKey(range)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

// -------- Taxonomy heatmap --------

export const getFilterCombinations = (range: DateRange, limit = 20) =>
  unstable_cache(
    async () => {
      const { from, to } = range;
      const rows = await db
        .select({
          area: sql<string>`COALESCE(${events.payload}->>'area', '∅')`,
          propertyType: sql<string>`COALESCE(${events.payload}->>'propertyType', '∅')`,
          useCase: sql<string>`COALESCE(${events.payload}->>'useCase', '∅')`,
          count: count(),
        })
        .from(events)
        .where(
          and(
            eq(events.eventType, 'filter_apply'),
            gte(events.createdAt, from),
            lte(events.createdAt, to)
          )
        )
        .groupBy(
          sql`COALESCE(${events.payload}->>'area', '∅')`,
          sql`COALESCE(${events.payload}->>'propertyType', '∅')`,
          sql`COALESCE(${events.payload}->>'useCase', '∅')`
        )
        .orderBy(desc(count()))
        .limit(limit);

      return rows.map((r) => ({
        area: r.area,
        propertyType: r.propertyType,
        useCase: r.useCase,
        count: Number(r.count),
      }));
    },
    ['admin.filterCombinations', rangeKey(range), String(limit)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

// -------- Area demand (for the Insights page) --------

export type PrefectureDemand = {
  prefectureSlug: string;
  leadCount: number;
  saveCount: number;
  areaCount: number;
};

/**
 * Rolls area interest up to the prefecture level. Combines leads and
 * city-type saves the same way getAreaInterest does (leads ×3 + saves),
 * and also reports the number of distinct areas that had any signal —
 * so admins can see breadth vs depth at a glance.
 */
export const getPrefectureDemand = (range: DateRange) =>
  unstable_cache(
    async () => {
      const { from, to } = range;

      const [leadRows, saveRows] = await Promise.all([
        db
          .select({
            prefectureSlug: leads.prefectureSlug,
            areaSlug: leads.areaSlug,
            count: count(),
          })
          .from(leads)
          .where(and(gte(leads.createdAt, from), lte(leads.createdAt, to)))
          .groupBy(leads.prefectureSlug, leads.areaSlug),
        db
          .select({
            contentId: saves.contentId,
            count: count(),
          })
          .from(saves)
          .where(
            and(
              eq(saves.contentType, 'city'),
              gte(saves.createdAt, from),
              lte(saves.createdAt, to)
            )
          )
          .groupBy(saves.contentId),
      ]);

      const prefectureMap = new Map<string, PrefectureDemand>();
      for (const r of leadRows) {
        const existing = prefectureMap.get(r.prefectureSlug) ?? {
          prefectureSlug: r.prefectureSlug,
          leadCount: 0,
          saveCount: 0,
          areaCount: 0,
        };
        existing.leadCount += Number(r.count);
        existing.areaCount += 1;
        prefectureMap.set(r.prefectureSlug, existing);
      }
      // Saves are keyed by contentId (area slug) without a prefecture on
      // the row. We best-effort attribute them by looking up a matching
      // prefecture from the lead rows; saves with no lead match fall
      // through to an "(unassigned)" bucket so nothing is silently dropped.
      const areaToPrefecture = new Map<string, string>();
      for (const r of leadRows) areaToPrefecture.set(r.areaSlug, r.prefectureSlug);
      for (const s of saveRows) {
        const prefecture = areaToPrefecture.get(s.contentId) ?? '(unassigned)';
        const existing = prefectureMap.get(prefecture) ?? {
          prefectureSlug: prefecture,
          leadCount: 0,
          saveCount: 0,
          areaCount: 0,
        };
        existing.saveCount += Number(s.count);
        prefectureMap.set(prefecture, existing);
      }

      return Array.from(prefectureMap.values())
        .sort((a, b) => b.leadCount * 3 + b.saveCount - (a.leadCount * 3 + a.saveCount));
    },
    ['admin.prefectureDemand', rangeKey(range)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

/**
 * Rollups of profile_snapshot JSON fields across all leads in range —
 * what budgets, property types, and use cases are expressing interest.
 *
 * Each dimension is its own pass:
 *  - Scalar fields (budget, condition, season, purpose) use json ->> and GROUP BY.
 *  - Array fields (types, useCases) use jsonb_array_elements_text so each
 *    element counts as its own row (a user wanting "apartment" AND "chalet"
 *    contributes to both buckets).
 */
export type ProfileAggregate = { value: string; count: number };
export type LeadProfileAggregates = {
  budget: ProfileAggregate[];
  propertyTypes: ProfileAggregate[];
  useCases: ProfileAggregate[];
  condition: ProfileAggregate[];
  totalLeads: number;
};

export const getLeadProfileAggregates = (range: DateRange) =>
  unstable_cache(
    async () => {
      const { from, to } = range;

      // postgres.js chokes on raw Date params inside db.execute(sql`…`)
      // (works fine in Drizzle's typed query builder). Pass ISO strings
      // with an explicit ::timestamptz cast so the Postgres side parses
      // them as timestamps — no reliance on postgres.js type inference.
      const fromIso = from.toISOString();
      const toIso = to.toISOString();

      const scalarRollup = async (key: string): Promise<ProfileAggregate[]> => {
        // Wrapped in a subquery because Drizzle parameterizes each ${key}
        // occurrence independently ($1, $2 etc.) and Postgres won't unify
        // the SELECT and GROUP BY expressions even when the values match.
        // The derived table extracts the value once; the outer GROUP BY
        // references the alias.
        const rows = await db.execute<{ value: string; count: string }>(sql`
          SELECT value, COUNT(*)::int AS count
          FROM (
            SELECT profile_snapshot->>${key} AS value
            FROM ${leads}
            WHERE ${leads.createdAt} >= ${fromIso}::timestamptz
              AND ${leads.createdAt} <= ${toIso}::timestamptz
          ) base
          WHERE value IS NOT NULL
          GROUP BY value
          ORDER BY count DESC
        `);
        return (rows as unknown as Array<{ value: string; count: string | number }>).map(
          (r) => ({ value: r.value, count: Number(r.count) })
        );
      };

      const arrayRollup = async (key: string): Promise<ProfileAggregate[]> => {
        // CASE coerces non-arrays to [] so jsonb_array_elements_text stays
        // total. Dates as ISO strings + ::timestamptz cast for the same
        // reason as scalarRollup.
        const rows = await db.execute<{ value: string; count: string }>(sql`
          SELECT elem AS value, COUNT(*)::int AS count
          FROM ${leads}
          CROSS JOIN LATERAL jsonb_array_elements_text(
            CASE
              WHEN jsonb_typeof(profile_snapshot->${key}) = 'array'
                THEN profile_snapshot->${key}
              ELSE '[]'::jsonb
            END
          ) AS elem
          WHERE ${leads.createdAt} >= ${fromIso}::timestamptz
            AND ${leads.createdAt} <= ${toIso}::timestamptz
          GROUP BY elem
          ORDER BY count DESC
        `);
        return (rows as unknown as Array<{ value: string; count: string | number }>).map(
          (r) => ({ value: r.value, count: Number(r.count) })
        );
      };

      const [budget, propertyTypes, useCases, condition, [{ c: totalLeads }]] =
        await Promise.all([
          scalarRollup('budget'),
          arrayRollup('types'),
          arrayRollup('useCases'),
          scalarRollup('condition'),
          db
            .select({ c: count() })
            .from(leads)
            .where(and(gte(leads.createdAt, from), lte(leads.createdAt, to))),
        ]);

      return {
        budget,
        propertyTypes,
        useCases,
        condition,
        totalLeads: Number(totalLeads ?? 0),
      } as LeadProfileAggregates;
    },
    ['admin.leadProfileAggregates', rangeKey(range)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

/**
 * Top-N areas over the range with their per-day lead count, pivoted into
 * a shape the stacked area chart wants: [{day, areaA, areaB, ...}, ...].
 */
export const getAreaDemandTrend = (range: DateRange, topN = 5) =>
  unstable_cache(
    async () => {
      const { from, to } = range;

      // First pass: find the top-N areas in the range.
      const ranking = await db
        .select({
          areaSlug: leads.areaSlug,
          count: count(),
        })
        .from(leads)
        .where(and(gte(leads.createdAt, from), lte(leads.createdAt, to)))
        .groupBy(leads.areaSlug)
        .orderBy(desc(count()))
        .limit(topN);

      if (ranking.length === 0) {
        return { series: [], data: [] as Array<Record<string, string | number>> };
      }

      const topSlugs = ranking.map((r) => r.areaSlug);

      // Second pass: per-day, per-area counts for just those top slugs.
      const rows = await db
        .select({
          day: sql<string>`to_char(date_trunc('day', ${leads.createdAt}), 'YYYY-MM-DD')`,
          areaSlug: leads.areaSlug,
          total: count(),
        })
        .from(leads)
        .where(
          and(
            gte(leads.createdAt, from),
            lte(leads.createdAt, to),
            inArray(leads.areaSlug, topSlugs)
          )
        )
        .groupBy(sql`date_trunc('day', ${leads.createdAt})`, leads.areaSlug)
        .orderBy(sql`date_trunc('day', ${leads.createdAt})`);

      const byDay = new Map<string, Record<string, string | number>>();
      for (const r of rows) {
        if (!byDay.has(r.day)) byDay.set(r.day, { day: r.day });
        byDay.get(r.day)![r.areaSlug] = Number(r.total);
      }
      for (const entry of byDay.values()) {
        for (const s of topSlugs) if (!(s in entry)) entry[s] = 0;
      }

      return {
        series: topSlugs,
        data: Array.from(byDay.values()),
      };
    },
    ['admin.areaDemandTrend', rangeKey(range), String(topN)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

// -------- Leads (with customer detail from auth.users) --------

export type LeadWithCustomer = {
  id: string;
  userId: string;
  customerEmail: string | null;
  customerName: string | null;
  areaSlug: string;
  prefectureSlug: string;
  profileSnapshot: unknown;
  status: string;
  katitasReference: string | null;
  notes: string | null;
  createdAt: Date;
  withdrawnAt: Date | null;
};

/**
 * Leads are not cached — Go&C looks at this view to action individual
 * leads, so freshness matters more than CPU savings. The base query
 * returns the lead row; a second (parallel) query joins auth.users to
 * pull email + display name. We don't own auth.users so we keep that
 * join explicit rather than burying it in a Drizzle relation.
 */
export async function getLeadsWithCustomers({
  from,
  to,
  limit = 500,
}: DateRange & { limit?: number }): Promise<LeadWithCustomer[]> {
  const leadRows = await db
    .select({
      id: leads.id,
      userId: leads.userId,
      areaSlug: leads.areaSlug,
      prefectureSlug: leads.prefectureSlug,
      profileSnapshot: leads.profileSnapshot,
      status: leads.status,
      katitasReference: leads.katitasReference,
      notes: leads.notes,
      createdAt: leads.createdAt,
      withdrawnAt: leads.withdrawnAt,
    })
    .from(leads)
    .where(and(gte(leads.createdAt, from), lte(leads.createdAt, to)))
    .orderBy(desc(leads.createdAt))
    .limit(limit);

  if (leadRows.length === 0) return [];

  const userIds = Array.from(new Set(leadRows.map((l) => l.userId)));

  const users = await db
    .select({
      id: authUsers.id,
      email: authUsers.email,
      metaData: authUsers.rawUserMetaData,
    })
    .from(authUsers)
    .where(inArray(authUsers.id, userIds));

  const userMap = new Map<string, { email: string | null; name: string | null }>();
  for (const u of users) {
    const meta = (u.metaData ?? null) as { name?: string } | null;
    userMap.set(u.id, {
      email: u.email ?? null,
      name: meta?.name ?? null,
    });
  }

  return leadRows.map((r) => ({
    ...r,
    customerEmail: userMap.get(r.userId)?.email ?? null,
    customerName: userMap.get(r.userId)?.name ?? null,
  }));
}

export const getFormSubmissionsForExport = (range: DateRange, limit = 1000) =>
  unstable_cache(
    async () => {
      const { from, to } = range;
      return db
        .select()
        .from(formSubmissions)
        .where(and(gte(formSubmissions.createdAt, from), lte(formSubmissions.createdAt, to)))
        .orderBy(desc(formSubmissions.createdAt))
        .limit(limit);
    },
    ['admin.formSubmissions', rangeKey(range), String(limit)],
    { revalidate: CACHE_TTL, tags: [TAG] }
  )();

/**
 * Most recent N leads with customer info. Used in the Overview hub as
 * an at-a-glance "who came in" block. Kept uncached for freshness.
 */
export async function getRecentLeads(limit = 5): Promise<LeadWithCustomer[]> {
  const to = new Date();
  const from = new Date(to.getTime() - 90 * 24 * 60 * 60 * 1000);
  return getLeadsWithCustomers({ from, to, limit });
}

/**
 * Parses &from=YYYY-MM-DD&to=YYYY-MM-DD search params into a DateRange,
 * clamping to safe bounds and defaulting to last 30 days.
 */
export function parseRange(params: { from?: string; to?: string }): DateRange {
  const now = new Date();
  const maxBack = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  const parseDate = (s?: string): Date | null => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const to = parseDate(params.to) ?? now;
  const from =
    parseDate(params.from) ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);

  return {
    from: from < maxBack ? maxBack : from,
    to: to > now ? now : to,
  };
}

// -------- Users (signed-up customer directory) --------

export type AdminUserRow = {
  id: string;
  email: string | null;
  name: string | null;
  createdAt: Date;
  lastSignInAt: Date | null;
  emailConfirmedAt: Date | null;
  savedCount: number;
  quizCompletions: number;
  leadCount: number;
};

/**
 * All signed-up users with rollups of their activity (saves, quiz
 * completions, leads). One SQL query — left-joins auth.users against
 * three counter subqueries so we don't round-trip per user.
 *
 * Not cached: Go&C wants to see sign-ups + activity near-realtime.
 */
export async function getAdminUsers({ limit = 500 }: { limit?: number } = {}): Promise<AdminUserRow[]> {
  // Build the three per-user counter CTEs, then left-join to auth.users.
  // Drizzle doesn't yet expose CTEs ergonomically for schema-qualified
  // tables so we keep this as a single select with correlated subqueries —
  // works the same, no Record-vs-array pitfalls.
  const rows = await db
    .select({
      id: authUsers.id,
      email: authUsers.email,
      metaData: authUsers.rawUserMetaData,
      createdAt: authUsers.createdAt,
      lastSignInAt: authUsers.lastSignInAt,
      emailConfirmedAt: authUsers.emailConfirmedAt,
      savedCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${saves}
        WHERE ${saves.userId} = ${authUsers.id}
      )`,
      quizCompletions: sql<number>`(
        SELECT COUNT(*)::int FROM ${events}
        WHERE ${events.userId} = ${authUsers.id}
          AND ${events.eventType} = 'quiz_complete'
      )`,
      leadCount: sql<number>`(
        SELECT COUNT(*)::int FROM ${leads}
        WHERE ${leads.userId} = ${authUsers.id}
      )`,
    })
    .from(authUsers)
    .orderBy(desc(authUsers.createdAt))
    .limit(limit);

  return rows.map((r) => {
    const meta = (r.metaData ?? null) as { name?: string } | null;
    return {
      id: r.id,
      email: r.email,
      name: meta?.name ?? null,
      createdAt: r.createdAt ?? new Date(0),
      lastSignInAt: r.lastSignInAt ?? null,
      emailConfirmedAt: r.emailConfirmedAt ?? null,
      savedCount: Number(r.savedCount ?? 0),
      quizCompletions: Number(r.quizCompletions ?? 0),
      leadCount: Number(r.leadCount ?? 0),
    };
  });
}

// Backwards-compat re-export so existing imports keep working.
export const getLeads = getLeadsWithCustomers;
