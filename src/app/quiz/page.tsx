'use client';

import { useRouter } from 'next/navigation';
import { useQuizStore } from '@/stores/quiz-store';
import { QUIZ_QUESTIONS, BUDGET_REALITY } from '@/lib/quiz/questions';
import { QuizStep } from '@/components/quiz/quiz-step';
import { QuizProgress } from '@/components/quiz/quiz-progress';
import { submitQuiz, trackQuizStart } from './actions';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef, useCallback } from 'react';

export default function QuizPage() {
  const router = useRouter();
  const {
    currentStep, answers, setAnswer, toggleMultiAnswer,
    nextStep, prevStep, setResults,
  } = useQuizStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasTrackedStart = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Step transition state
  const [transitioning, setTransitioning] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [displayStep, setDisplayStep] = useState(currentStep);

  useEffect(() => {
    if (!hasTrackedStart.current && currentStep === 0) {
      hasTrackedStart.current = true;
      trackQuizStart();
    }
  }, [currentStep]);

  // Handle step transition animation
  useEffect(() => {
    if (currentStep === displayStep) return;

    setDirection(currentStep > displayStep ? 'forward' : 'back');
    setTransitioning(true);

    const timer = setTimeout(() => {
      setDisplayStep(currentStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitioning(false);
        });
      });
    }, 150);

    return () => clearTimeout(timer);
  }, [currentStep, displayStep]);

  const question = QUIZ_QUESTIONS[displayStep];
  const isLastStep = currentStep === QUIZ_QUESTIONS.length - 1;
  const isMulti = question.multiSelect;

  const currentAnswer = answers[question.id];
  const hasAnswer = isMulti
    ? Array.isArray(currentAnswer) && currentAnswer.length > 0
    : currentAnswer !== undefined;

  const isBudgetStep = question.id === 'budget';
  const budgetAnswer = answers.budget as string | undefined;
  const budgetReality = budgetAnswer ? BUDGET_REALITY[budgetAnswer] : null;

  const handleAutoAdvance = useCallback(() => {
    if (!isLastStep && !isMulti) {
      nextStep();
    }
  }, [isLastStep, isMulti, nextStep]);

  async function handleSubmit() {
    if (!hasAnswer) return;
    setIsSubmitting(true);
    try {
      const { results, profile } = await submitQuiz(answers);
      setResults(results, profile);
      router.push('/quiz/results');
    } catch {
      setIsSubmitting(false);
    }
  }

  function handleNext() {
    if (isLastStep) {
      handleSubmit();
    } else {
      nextStep();
    }
  }

  function handleBack() {
    prevStep();
  }

  const showNextButton = isMulti || isBudgetStep || isLastStep;

  // Tier 1: simple opacity fade, no slide. 150ms fast duration.

  return (
    <div ref={containerRef} className="ma-page px-ma-6 py-ma-24">
      <div className="ma-content mx-auto">
        {/* Progress — stays fixed, no transition */}
        <div className="mb-ma-12">
          <div className="flex items-baseline justify-between mb-ma-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-stone">
              Find your area
            </p>
            <p className="text-[11px] text-stone tabular-nums">
              <span className="text-sumi font-medium">{currentStep + 1}</span>
              <span className="text-stone/60"> / {QUIZ_QUESTIONS.length}</span>
            </p>
          </div>
          <QuizProgress currentStep={currentStep} />
        </div>

        {/* Step content — animated */}
        <div
          style={{
            opacity: transitioning ? 0 : 1,
            transition: 'opacity 150ms var(--ease-settle)',
          }}
        >
          <QuizStep
            key={question.id}
            question={question}
            selectedAnswer={currentAnswer}
            onSelect={(answerId) => setAnswer(question.id, answerId)}
            onToggleMulti={isMulti
              ? (answerId) => toggleMultiAnswer(question.id, answerId, question.maxSelections || 3)
              : undefined
            }
            onAutoAdvance={!isLastStep && !isMulti && !isBudgetStep ? handleAutoAdvance : undefined}
          />

          {/* Budget reality check — borderless card matching the rest
              of the modernised vocabulary. Soft accent rail on the
              left replaces the previous bordered ai/20 box. */}
          {isBudgetStep && budgetReality && (
            <div className="relative mt-ma-8 bg-shoji rounded-xl shadow-card overflow-hidden p-ma-6 pl-[28px] animate-fade-in">
              <span aria-hidden className="absolute top-0 bottom-0 left-0 w-[3px] bg-ai" />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-ai mb-ma-3">
                Reality check
              </p>
              <p className="text-[14px] text-sumi leading-relaxed mb-ma-2">
                <span className="font-semibold">What this buys: </span>
                {budgetReality.what}
              </p>
              <p className="text-[14px] text-sumi-light leading-relaxed">
                <span className="font-semibold text-sumi">Expect: </span>
                {budgetReality.expect}
              </p>
              {budgetReality.warning && (
                <p className="text-[13px] text-beni/85 leading-relaxed mt-ma-3 pl-ma-3 border-l-2 border-beni/40">
                  {budgetReality.warning}
                </p>
              )}
            </div>
          )}

          <div className="mt-ma-16 flex items-center justify-between gap-ma-4">
            <div>
              {currentStep > 0 && (
                <Button variant="ghost" onClick={handleBack}>
                  ← Back
                </Button>
              )}
            </div>
            <div>
              {showNextButton && (
                <Button
                  onClick={handleNext}
                  disabled={!hasAnswer || isSubmitting}
                >
                  {isSubmitting ? 'Building your shortlist…' : isLastStep ? 'See my results →' : 'Next →'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
