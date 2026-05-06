import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TOTAL_STEPS } from '@/lib/quiz/questions';

// Answers can be a single string OR an array of strings (for multi-select)
export type QuizAnswers = Record<string, string | string[]>;

export type QuizResult = {
  citySlug: string;
  cityName: string;
  prefectureSlug: string;
  prefectureName: string;
  score: number;
  explanation: string;
  // Directory card enrichment — kept optional so older results in
  // localStorage don't break the type narrowing on the results page.
  regionType?: string | null;
  heroImagePath?: string | null;
  avgPropertyPriceJpy?: number | null;
  timeFromSydney?: string | null;
  timeFromMelbourne?: string | null;
  timeFromBrisbane?: string | null;
  timeFromPerth?: string | null;
  timeFromAdelaide?: string | null;
  offSeasonActivitiesScore?: number | null;
};

export type PropertyProfile = {
  types: string[];
  condition: string;
  budget: string;
  summary: string;
};

interface QuizState {
  currentStep: number;
  answers: QuizAnswers;
  results: QuizResult[] | null;
  profile: PropertyProfile | null;
  isComplete: boolean;

  setAnswer: (questionId: string, answerId: string | string[]) => void;
  toggleMultiAnswer: (questionId: string, answerId: string, max: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setResults: (results: QuizResult[], profile: PropertyProfile) => void;
  reset: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: {},
      results: null,
      profile: null,
      isComplete: false,

      setAnswer: (questionId, answerId) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: answerId },
        })),

      toggleMultiAnswer: (questionId, answerId, max) =>
        set((state) => {
          const current = (state.answers[questionId] as string[]) || [];
          const exists = current.includes(answerId);
          let next: string[];
          if (exists) {
            next = current.filter((id) => id !== answerId);
          } else if (current.length < max) {
            next = [...current, answerId];
          } else {
            next = current;
          }
          return { answers: { ...state.answers, [questionId]: next } };
        }),

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, TOTAL_STEPS - 1),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),

      setResults: (results, profile) =>
        set({ results, profile, isComplete: true }),

      reset: () =>
        set({ currentStep: 0, answers: {}, results: null, profile: null, isComplete: false }),
    }),
    {
      name: 'japanoma-quiz-v2',
    }
  )
);
