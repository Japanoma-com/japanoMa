import type { QuizAnswers } from '@/stores/quiz-store';
import type { QuizContextSnapshot } from '@/lib/validations/contact';
import { QUIZ_QUESTIONS } from './questions';

/**
 * Look up the human-readable label for a single-select answer ID.
 * Returns undefined if the question or answer is unknown.
 */
function lookupLabel(questionId: string, answerId: string): string | undefined {
  const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
  return question?.answers.find((a) => a.id === answerId)?.label;
}

/**
 * Look up labels for a multi-select answer ID array.
 * Filters out any unknown IDs.
 */
function lookupLabels(questionId: string, answerIds: string[]): string[] {
  const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
  if (!question) return [];
  return answerIds
    .map((id) => question.answers.find((a) => a.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}

/**
 * Convert raw Zustand quiz answers into a labeled snapshot suitable
 * for storing in form_submissions.source_context.quizContext.
 *
 * Returns null if no recognised quiz answers are present.
 */
export function extractQuizContext(answers: QuizAnswers): QuizContextSnapshot | null {
  const snapshot: QuizContextSnapshot = {};

  const purpose = answers.purpose;
  if (typeof purpose === 'string') {
    const label = lookupLabel('purpose', purpose);
    if (label) snapshot.purpose = label;
  }

  const skiSeason = answers.ski_season;
  if (typeof skiSeason === 'string') {
    const label = lookupLabel('ski_season', skiSeason);
    if (label) snapshot.skiSeason = label;
  }

  const familyComposition = answers.family_composition;
  if (typeof familyComposition === 'string') {
    const label = lookupLabel('family_composition', familyComposition);
    if (label) snapshot.familyComposition = label;
  }

  const propertyType = answers.property_type;
  if (Array.isArray(propertyType) && propertyType.length > 0) {
    const labels = lookupLabels('property_type', propertyType);
    if (labels.length > 0) snapshot.propertyTypes = labels;
  } else if (typeof propertyType === 'string') {
    const labels = lookupLabels('property_type', [propertyType]);
    if (labels.length > 0) snapshot.propertyTypes = labels;
  }

  const condition = answers.condition;
  if (typeof condition === 'string') {
    const label = lookupLabel('condition', condition);
    if (label) snapshot.condition = label;
  }

  const budget = answers.budget;
  if (typeof budget === 'string') {
    const label = lookupLabel('budget', budget);
    if (label) snapshot.budget = label;
  }

  const priority = answers.priority;
  if (typeof priority === 'string') {
    const label = lookupLabel('priority', priority);
    if (label) snapshot.priority = label;
  }

  return Object.keys(snapshot).length > 0 ? snapshot : null;
}
