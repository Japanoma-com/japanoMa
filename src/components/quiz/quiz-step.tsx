'use client';

import type { QuizQuestion, DifficultyLevel } from '@/lib/quiz/questions';
import { getQuizVisual } from './quiz-icons';

interface QuizStepProps {
  question: QuizQuestion;
  selectedAnswer: string | string[] | undefined;
  onSelect: (answerId: string) => void;
  onToggleMulti?: (answerId: string) => void;
  onAutoAdvance?: () => void;
}

/**
 * Difficulty gauge — speedometer-style semicircular dial with five
 * coloured zones (green→red) and a needle pointing at the level.
 *
 * Why a gauge instead of N dots: people read a needle's position
 * against a coloured spectrum instantly ("the needle is in the red")
 * — no counting filled dots, no decoding what "3 of 5" means. Same
 * metaphor speedometers, fuel gauges, and difficulty meters across
 * consumer products use, so it ports without explanation.
 */
const DIFFICULTY_CONFIG: Record<DifficultyLevel, {
  index: number; // 0-based slot in the 5-zone gauge
  textColor: string;
}> = {
  easy:        { index: 0, textColor: 'text-matsu' },
  moderate:    { index: 1, textColor: 'text-matsu/85' },
  involved:    { index: 2, textColor: 'text-kohaku' },
  challenging: { index: 3, textColor: 'text-beni/80' },
  advanced:    { index: 4, textColor: 'text-beni' },
};

// Five colour zones interpolating across the Ma Space semantic
// palette: matsu (green) → kohaku (amber) → beni (red).
const ZONE_COLORS = [
  '#4A6B52', // matsu — easy
  '#7A8E4A', // olive — moderate
  '#A67B3D', // kohaku — involved
  '#B0573D', // rusty orange — challenging
  '#8B3A3A', // beni — advanced
];

// Gauge geometry. Upper semicircle centred at (50, 50), radius 40,
// in a 100×60 viewBox so strokeWidth=9 zones still fit cleanly.
const CX = 50;
const CY = 50;
const R = 40;

function polar(angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  return [CX + R * Math.cos(rad), CY - R * Math.sin(rad)];
}

function arcPath(fromDeg: number, toDeg: number): string {
  const [x1, y1] = polar(fromDeg);
  const [x2, y2] = polar(toDeg);
  // Small arc, sweep=0 keeps us on the upper semicircle.
  return `M ${x1} ${y1} A ${R} ${R} 0 0 0 ${x2} ${y2}`;
}

// Five zones, each 36° of the 180° semicircle. 180° = left edge
// (easy / green); 0° = right edge (advanced / red).
const ZONES = [
  { from: 180, to: 144 }, // easy
  { from: 144, to: 108 }, // moderate
  { from: 108, to: 72 },  // involved
  { from: 72,  to: 36 },  // challenging
  { from: 36,  to: 0 },   // advanced
];

function DifficultyGauge({
  level,
  label,
  isSelected,
}: {
  level: DifficultyLevel;
  label: string;
  isSelected: boolean;
}) {
  const config = DIFFICULTY_CONFIG[level];
  // Needle points to the centre of the active zone.
  const needleAngle = 162 - config.index * 36;
  const [tipX, tipY] = polar(needleAngle);
  // Pull the needle root inside the pivot so it doesn't sit dead
  // on the dot — gives a clearer "needle on dial" read.
  const ROOT_OFFSET = 6;
  const dx = ((tipX - CX) * ROOT_OFFSET) / R;
  const dy = ((tipY - CY) * ROOT_OFFSET) / R;

  return (
    <div className="relative mt-ma-4 pt-ma-3">
      <span aria-hidden className="absolute top-0 left-0 right-0 h-px bg-border/40" />
      <div className="flex items-center justify-between gap-ma-3">
        <svg
          viewBox="0 0 100 60"
          className="w-[88px] h-[52px] flex-shrink-0"
          aria-hidden
          style={{
            opacity: isSelected ? 1 : 0.75,
            transition: 'opacity 200ms var(--ease-settle)',
          }}
        >
          {ZONES.map((zone, i) => {
            const active = i === config.index;
            return (
              <path
                key={i}
                d={arcPath(zone.from, zone.to)}
                stroke={ZONE_COLORS[i]}
                strokeWidth={9}
                strokeLinecap="butt"
                fill="none"
                opacity={active ? 1 : 0.3}
              />
            );
          })}

          {/* Needle — thin sumi line. */}
          <line
            x1={CX + dx}
            y1={CY + dy}
            x2={tipX}
            y2={tipY}
            stroke="#1A1816"
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Pivot — sumi outer + kinu inner, reads as a polished bezel. */}
          <circle cx={CX} cy={CY} r={4.5} fill="#1A1816" />
          <circle cx={CX} cy={CY} r={2} fill="#FAFAF7" />
        </svg>

        <span
          className={`text-[10px] font-ui font-bold tracking-wider uppercase ${config.textColor} transition-opacity duration-base ease-settle ${
            isSelected ? 'opacity-100' : 'opacity-60'
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

export function QuizStep({ question, selectedAnswer, onSelect, onToggleMulti, onAutoAdvance }: QuizStepProps) {
  const isMulti = question.multiSelect;
  const selectedSet = new Set(
    isMulti
      ? (selectedAnswer as string[] | undefined) || []
      : selectedAnswer ? [selectedAnswer as string] : []
  );

  function handleClick(answerId: string) {
    if (isMulti && onToggleMulti) {
      onToggleMulti(answerId);
    } else {
      onSelect(answerId);
      if (onAutoAdvance) {
        setTimeout(onAutoAdvance, 350);
      }
    }
  }

  return (
    <div>
      <h2 className="mb-ma-3 font-editorial text-[32px] sm:text-[36px] leading-[1.15] text-sumi">
        {question.title}
      </h2>
      {question.subtitle && (
        <p className="text-sumi-light text-[14px] sm:text-[15px] leading-relaxed mb-ma-10 max-w-xl">
          {question.subtitle}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-ma-3">
        {question.answers.map((answer) => {
          const isSelected = selectedSet.has(answer.id);
          const visual = getQuizVisual(answer.id);

          return (
            <button
              key={answer.id}
              onClick={() => handleClick(answer.id)}
              aria-pressed={isSelected}
              // Borderless filled card. Definition by surface + shadow at
              // rest, soft shadow lift on hover, indigo ring + tint on
              // selected. Same vocabulary as AreaCardFrame.
              className={`group relative text-left rounded-xl p-ma-6 transition-[background-color,box-shadow,transform] duration-base ease-settle ${
                isSelected
                  ? 'bg-kinu ring-1 ring-ai/40 shadow-[0_4px_20px_-4px_rgba(61,90,122,0.18)]'
                  : 'bg-shoji shadow-card hover:bg-kinu hover:shadow-[0_4px_18px_-4px_rgba(26,24,22,0.12)] hover:-translate-y-[1px]'
              }`}
            >
              {/* Visual element: icon, kanji, or nothing */}
              {visual?.type === 'icon' && (
                <span className={`mb-ma-3 block transition-colors duration-base ease-settle ${
                  isSelected ? 'text-ai' : 'text-stone group-hover:text-sumi-light'
                }`}>
                  <visual.Component className="w-7 h-7" />
                </span>
              )}
              <span className={`text-[15px] font-ui font-semibold block leading-snug pr-ma-6 ${
                isSelected ? 'text-ai-deep' : 'text-sumi'
              }`}>
                {answer.label}
              </span>
              {answer.description && (
                <span className="text-[12px] text-stone mt-ma-1 block leading-relaxed">
                  {answer.description}
                </span>
              )}

              {/* Difficulty gauge */}
              {answer.difficulty && (
                <DifficultyGauge
                  level={answer.difficulty.level}
                  label={answer.difficulty.label}
                  isSelected={isSelected}
                />
              )}

              {isSelected && (
                <span
                  aria-hidden
                  className="absolute top-ma-3 right-ma-3 w-5 h-5 rounded-full bg-ai flex items-center justify-center shadow-[0_2px_6px_rgba(61,90,122,0.3)] animate-fade-in"
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isMulti && (
        <div className="mt-ma-4 flex justify-center">
          <span className="inline-flex items-center gap-ma-2 bg-shoji rounded-full px-ma-3 py-1 text-[11px] text-sumi-light tabular-nums">
            <span className="w-[5px] h-[5px] rounded-full bg-ai" aria-hidden />
            <span className="text-sumi font-medium">{selectedSet.size}</span>
            <span className="text-stone">of {question.maxSelections || 3} selected</span>
          </span>
        </div>
      )}
    </div>
  );
}
