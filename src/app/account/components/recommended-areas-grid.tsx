import { AreaCard } from './area-card';
import { ScrollReveal } from '@/components/japandi/scroll-reveal';
import type { PropertyProfile, QuizResult } from '@/lib/account/queries';

type Props = {
  areas: QuizResult[];
  profile: PropertyProfile;
  hasActiveConsent: boolean;
  activeLeadsByArea: Map<string, { id: string }>;
  consentVersion: string;
  consentBody: string;
};

export function RecommendedAreasGrid({
  areas,
  profile,
  hasActiveConsent,
  activeLeadsByArea,
  consentVersion,
  consentBody,
}: Props) {
  return (
    <div>
      {/*
        items-start prevents the grid from stretching each card to match
        the tallest sibling in a row. Combined with half-variant cards
        using line-clamp-2 on the explanation, cards land at similar
        natural heights and buttons align without ghost-space above them.
      */}
      <div className="grid grid-cols-1 sm:grid-cols-2 items-start gap-ma-4 [&>*:first-child]:col-span-full">
        {areas.map((area, index) => (
          <ScrollReveal key={area.citySlug} index={index}>
            <AreaCard
              variant={index === 0 ? 'hero' : 'half'}
              topMatchBadge={index === 0}
              cityName={area.cityName}
              prefectureName={area.prefectureName}
              citySlug={area.citySlug}
              prefectureSlug={area.prefectureSlug}
              score={area.score}
              explanation={area.explanation}
              heroImagePath={area.heroImagePath}
              profileSnapshot={{ ...profile, score: area.score }}
              hasActiveConsent={hasActiveConsent}
              initialLead={
                activeLeadsByArea.has(area.citySlug)
                  ? { id: activeLeadsByArea.get(area.citySlug)!.id }
                  : null
              }
              consentVersion={consentVersion}
              consentBody={consentBody}
            />
          </ScrollReveal>
        ))}
      </div>

      <p className="mt-ma-8 px-ma-4 py-ma-3 bg-shoji/50 rounded-md text-[12px] text-stone leading-relaxed">
        Curated listings from our Japanese partner network activate Q3 2026.
        Your interest today helps us prioritise which areas we source first.
      </p>
    </div>
  );
}
