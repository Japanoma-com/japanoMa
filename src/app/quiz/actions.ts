'use server';

import { scoreQuiz } from '@/lib/quiz/scoring';
import { db } from '@/lib/db';
import { quizResponses, events } from '@/lib/db/schema';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { captureSignalSafe } from '@/lib/journey/capture-safe';
import type { QuizAnswers } from '@/stores/quiz-store';

async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('jt_session')?.value ?? null;
}

export async function trackQuizStart() {
  try {
    const sessionId = await getSessionId();
    if (sessionId) {
      await db.insert(events).values({
        sessionId,
        eventType: 'quiz_start',
        payload: { quizType: 'lifestyle-v2' },
      });
    }
    // D2L journey: advance to phase 1_decision
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await captureSignalSafe(user?.id, 'quiz_started');
  } catch {
    // Non-blocking
  }
}

export async function submitQuiz(answers: QuizAnswers) {
  const { results, profile } = await scoreQuiz(answers);

  try {
    const sessionId = await getSessionId();

    // Fetch the authenticated user, if any. This call is wrapped in its own
    // try so a transient auth-service failure doesn't prevent us from writing
    // the quiz row — the row can still be written with userId: null and
    // backfilled later by migrateAnonymousData if the user is actually authed.
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch (authError) {
      console.warn('submitQuiz: auth lookup failed, persisting anonymously', authError);
    }

    if (sessionId) {
      await db.insert(quizResponses).values({
        sessionId,
        userId,
        quizType: 'lifestyle-v2',
        responses: { answers, results, profile },
      });

      await db.insert(events).values({
        sessionId,
        userId,
        eventType: 'quiz_complete',
        payload: {
          quizType: 'lifestyle-v2',
          answers,
          recommendedAreas: results.map((r) => r.citySlug),
          propertyTypes: profile.types,
          condition: profile.condition,
          budget: profile.budget,
        },
      });
    }

    // D2L journey: advance to phase 3_area
    await captureSignalSafe(userId, 'quiz_completed', {
      profileTypes: profile.types,
      condition: profile.condition,
    });
  } catch (error) {
    console.error('Failed to save quiz response:', error);
  }

  return { results, profile };
}
