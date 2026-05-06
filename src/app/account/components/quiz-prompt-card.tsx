// src/app/account/components/quiz-prompt-card.tsx
// Editorial empty-state for the recommendations section when the user
// hasn't taken the quiz. Generous, calm, on-brand — replaces the
// generic shoji panel.
import Link from 'next/link';

export function QuizPromptCard() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-kinu shadow-card">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-ma-8 items-center p-ma-8 md:p-ma-12">
        <div className="max-w-[420px]">
          <p className="label-overline text-ai mb-ma-3">5 minutes</p>
          <p className="font-editorial text-2xl text-sumi leading-snug mb-ma-3">
            Find the regions that fit your life.
          </p>
          <p className="text-sm text-sumi-light leading-relaxed">
            Twelve quick questions about your goals, budget, and trade-offs.
            We match you to two-to-four Japanese ski regions and explain why.
          </p>
        </div>
        <div className="flex md:flex-col items-start gap-ma-3">
          <Link
            href="/quiz"
            className="group inline-flex items-center gap-ma-2 h-11 px-ma-6 bg-ai text-kinu text-sm font-ui font-semibold rounded-md transition-[background-color,box-shadow,transform] duration-base ease-settle hover:bg-ai-deep hover:shadow-[0_4px_12px_-2px_rgba(61,90,122,0.35)] active:scale-[0.98]"
          >
            Start the quiz
            <span aria-hidden className="transition-transform duration-base ease-settle group-hover:translate-x-0.5">→</span>
          </Link>
          <Link
            href="/areas"
            className="text-xs font-ui text-stone hover:text-sumi transition-colors duration-base ease-settle inline-flex items-center gap-1"
          >
            Browse all areas first
            <span aria-hidden className="text-[10px]">↗</span>
          </Link>
        </div>
      </div>
      {/* Decorative bottom accent — subtle, full-width hairline */}
      <div className="h-[3px] bg-gradient-to-r from-ai/0 via-ai/30 to-ai/0" aria-hidden />
    </div>
  );
}
