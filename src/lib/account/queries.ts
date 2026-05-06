import { db } from '@/lib/db';
import { cities, quizResponses, saves } from '@/lib/db/schema';
import { and, count, desc, eq, inArray } from 'drizzle-orm';

// Shape verified at src/app/quiz/actions.ts:39 — the quiz submit action
// writes the whole { answers, results, profile } object into
// quiz_responses.responses as jsonb.
export type PropertyProfile = {
  types: string[];
  condition: string;
  budget: string;
  summary: string;
};

export type QuizResult = {
  citySlug: string;
  cityName: string;
  prefectureSlug: string;
  prefectureName: string;
  score: number;
  explanation: string;
  heroImagePath: string | null;
};

type StoredResultShape = Omit<QuizResult, 'heroImagePath'> & {
  heroImagePath?: string | null;
};

type StoredResponsesShape = {
  answers: Record<string, unknown>;
  results: StoredResultShape[];
  profile: PropertyProfile;
};

export type UserQuizProfile = {
  profile: PropertyProfile;
  recommendedAreas: QuizResult[];
  completedAt: Date;
};

/**
 * Returns the user's most recent completed quiz, unpacked into the same
 * shape the frontend card renderer expects. Returns null if the user has
 * never completed a quiz (or their anonymous quiz has not yet been migrated
 * — local-storage-sync.tsx calls router.refresh() after migration to close
 * that gap).
 */
export async function getUserQuizProfile(userId: string): Promise<UserQuizProfile | null> {
  const rows = await db
    .select()
    .from(quizResponses)
    .where(and(eq(quizResponses.userId, userId), eq(quizResponses.quizType, 'lifestyle-v2')))
    .orderBy(desc(quizResponses.createdAt))
    .limit(1);

  const row = rows[0];
  if (!row || !row.responses) return null;

  const stored = row.responses as StoredResponsesShape;
  if (!stored.profile || !stored.results) return null;

  // Quiz results are stored as a JSONB snapshot at submit time and don't
  // include hero imagery. Join the cities table on city slugs so the cards
  // can render imagery without bloating quiz_responses, and so swapping a
  // city's hero image flows through to existing accounts on next render.
  const slugs = stored.results.map((r) => r.citySlug);
  const heroRows = slugs.length
    ? await db
        .select({ slug: cities.slug, heroImagePath: cities.heroImagePath })
        .from(cities)
        .where(inArray(cities.slug, slugs))
    : [];
  const heroBySlug = new Map(heroRows.map((row) => [row.slug, row.heroImagePath]));

  const recommendedAreas: QuizResult[] = stored.results.map((r) => ({
    citySlug: r.citySlug,
    cityName: r.cityName,
    prefectureSlug: r.prefectureSlug,
    prefectureName: r.prefectureName,
    score: r.score,
    explanation: r.explanation,
    heroImagePath: heroBySlug.get(r.citySlug) ?? r.heroImagePath ?? null,
  }));

  return {
    profile: stored.profile,
    recommendedAreas,
    completedAt: row.createdAt,
  };
}

/**
 * Returns the count of saved items (content_type + content_id pairs) for a
 * given user. Used by the /account concierge sidebar to show a Saves stat.
 * Returns 0 when the user has no saves.
 */
export async function getUserSavesCount(userId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(saves)
    .where(eq(saves.userId, userId));

  return result[0]?.count ?? 0;
}

export type SavedItem = {
  id: string;
  contentType: 'city' | 'article';
  contentId: string;
  title: string;
  href: string;
  createdAt: Date;
};

/**
 * Returns the user's saved items with display metadata. Orders by most
 * recently saved first. Rows missing title or href (legacy pre-2026-04-10
 * rows without the denormalized display columns) are filtered out — they
 * can be re-saved by the user to get the new shape.
 */
export async function getUserSaves(userId: string): Promise<SavedItem[]> {
  const rows = await db
    .select({
      id: saves.id,
      contentType: saves.contentType,
      contentId: saves.contentId,
      title: saves.title,
      href: saves.href,
      createdAt: saves.createdAt,
    })
    .from(saves)
    .where(eq(saves.userId, userId))
    .orderBy(desc(saves.createdAt));

  return rows
    .filter((r): r is typeof r & { title: string; href: string } =>
      Boolean(r.title) && Boolean(r.href)
    )
    .map((r) => ({
      id: r.id,
      contentType: r.contentType === 'article' ? 'article' : 'city',
      contentId: r.contentId,
      title: r.title,
      href: r.href,
      createdAt: r.createdAt,
    }));
}
