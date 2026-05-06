import { db } from '@/lib/db';
import { cities, prefectures } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { QuizAnswers, QuizResult, PropertyProfile } from '@/stores/quiz-store';
import { CONDITION_LABELS, PROPERTY_TYPE_LABELS, BUDGET_REALITY } from './questions';

/**
 * Scoring Philosophy:
 * - Every dimension contributes positively (no zero-score traps)
 * - Base score floor ensures top results feel motivating (65+)
 * - Differentiation comes from relative scoring, not absolute
 * - Users should always see at least one "Strong match"
 */

// Purpose → area type affinity (0-25 points)
// Every purpose has some affinity for ski_resort since all P1 cities are ski areas
const PURPOSE_AFFINITY: Record<string, Record<string, number>> = {
  'holiday':          { ski_resort: 22, onsen_town: 25, mountain_village: 20, lakeside: 18, rural_town: 15, urban_access: 8, coastal: 8 },
  'ski-base':         { ski_resort: 25, onsen_town: 15, mountain_village: 18, lakeside: 10, rural_town: 8, urban_access: 5, coastal: 5 },
  'year-round':       { ski_resort: 15, onsen_town: 25, mountain_village: 22, lakeside: 22, rural_town: 20, urban_access: 18, coastal: 18 },
  'investment':       { ski_resort: 22, onsen_town: 18, mountain_village: 12, lakeside: 10, rural_town: 8, urban_access: 25, coastal: 15 },
  'lifestyle-income': { ski_resort: 25, onsen_town: 22, mountain_village: 18, lakeside: 15, rural_town: 12, urban_access: 15, coastal: 12 },
};

// Ski season → how much proximity boosts score (0-25 points)
const SEASON_WEIGHT: Record<string, number> = {
  'weekend': 8,
  'annual': 15,
  'regular': 22,
  'full': 25,
};

// Property type → area compatibility (0-15 points)
const TYPE_AFFINITY: Record<string, Record<string, number>> = {
  'detached':  { ski_resort: 15, onsen_town: 12, mountain_village: 15, rural_town: 14, lakeside: 12, urban_access: 6, coastal: 8 },
  'apartment': { ski_resort: 12, onsen_town: 8, mountain_village: 5, rural_town: 4, lakeside: 5, urban_access: 15, coastal: 10 },
  'akiya':     { ski_resort: 10, onsen_town: 12, mountain_village: 15, rural_town: 15, lakeside: 12, urban_access: 3, coastal: 5 },
  'land':      { ski_resort: 8, onsen_town: 8, mountain_village: 12, rural_town: 12, lakeside: 10, urban_access: 5, coastal: 8 },
  'kominka':   { ski_resort: 6, onsen_town: 15, mountain_village: 14, rural_town: 15, lakeside: 10, urban_access: 3, coastal: 3 },
};

// Family composition → municipality culture affinity (0-10 points).
// Light weighting until we have ground-truth "family-friendliness" /
// "retirement-quiet" / "multi-gen tradition" data per city. The signal
// still nudges results toward culturally appropriate areas based on
// region archetypes that hold across Northern Japan snow country.
const FAMILY_AFFINITY: Record<string, Record<string, number>> = {
  // Solo travellers want flexibility — ski_resort + urban_access score highest.
  'solo':         { ski_resort: 10, urban_access: 10, onsen_town: 8, mountain_village: 7, rural_town: 6, lakeside: 7, coastal: 6 },
  // Couples score evenly across most types — flexible and adaptable.
  'couple':       { ski_resort: 9, onsen_town: 9, mountain_village: 8, lakeside: 9, rural_town: 7, urban_access: 8, coastal: 8 },
  // Young families need community + amenities; ski resorts and onsen towns
  // with established services beat very rural municipalities.
  'young_family': { ski_resort: 10, onsen_town: 9, urban_access: 9, mountain_village: 6, lakeside: 7, rural_town: 5, coastal: 7 },
  // Teens need transport + things to do beyond snow.
  'teen_family':  { ski_resort: 9, urban_access: 10, onsen_town: 8, lakeside: 7, mountain_village: 5, rural_town: 4, coastal: 7 },
  // Empty nest leans into quieter, slower towns.
  'empty_nest':   { onsen_town: 10, lakeside: 9, rural_town: 9, mountain_village: 9, ski_resort: 7, urban_access: 5, coastal: 8 },
  // Multi-generational fits traditional villages with kominka heritage.
  'multi_gen':    { rural_town: 10, mountain_village: 10, onsen_town: 9, lakeside: 8, ski_resort: 5, urban_access: 4, coastal: 6 },
};

// Priority → what the user values most (0-20 points)
type CityRow = Awaited<ReturnType<typeof getP1CitiesForScoring>>[number];

function scorePriority(city: CityRow, priority: string): number {
  switch (priority) {
    case 'slopes': {
      if (city.carToSlopeMin !== null && city.carToSlopeMin <= 15) return 20;
      if (city.shuttleBus) return 17;
      if (city.carToSlopeMin !== null && city.carToSlopeMin <= 30) return 14;
      return 10;
    }
    case 'onsen':
      return city.regionType === 'onsen_town' ? 20 : 12;
    case 'affordable':
      return city.contentPriority === 'low' ? 20 : city.contentPriority === 'medium' ? 16 : 12;
    case 'four-seasons':
      if (city.regionType === 'onsen_town' || city.regionType === 'lakeside') return 20;
      if (city.regionType === 'rural_town' || city.regionType === 'mountain_village') return 17;
      return 12;
    default:
      return 12;
  }
}

// Budget fit (0-15 points)
// Generous scoring — most combinations get decent points
function scoreBudget(city: CityRow, budget: string): number {
  switch (budget) {
    case 'under-15m':
      return city.contentPriority === 'high' ? 10 : 15;
    case '15-30m':
      return 14; // Most common, most areas work
    case '30-50m':
      return 15; // Higher budget = more options everywhere
    case '50m+':
      return 15;
    default:
      return 12;
  }
}

async function getP1CitiesForScoring() {
  return db
    .select({
      citySlug: cities.slug,
      cityName: cities.nameEn,
      cityNameJa: cities.nameJa,
      regionType: cities.regionType,
      contentPriority: cities.contentPriority,
      shuttleBus: cities.shuttleBus,
      busToSlopeMin: cities.busToSlopeMin,
      carToSlopeMin: cities.carToSlopeMin,
      closestAirport: cities.closestAirport,
      airportTimeMin: cities.airportTimeMin,
      closestStation: cities.closestStation,
      stationTimeMin: cities.stationTimeMin,
      // Surface enrichment fields so /quiz/results cards can render
      // the same editorial layout as the /areas directory.
      heroImagePath: cities.heroImagePath,
      avgPropertyPriceJpy: cities.avgPropertyPriceJpy,
      timeFromSydney: cities.timeFromSydney,
      timeFromMelbourne: cities.timeFromMelbourne,
      timeFromBrisbane: cities.timeFromBrisbane,
      timeFromPerth: cities.timeFromPerth,
      timeFromAdelaide: cities.timeFromAdelaide,
      offSeasonActivitiesScore: cities.offSeasonActivitiesScore,
      population: cities.population,
      municipalityUrl: cities.municipalityUrl,
      prefectureSlug: prefectures.slug,
      prefectureName: prefectures.nameEn,
    })
    .from(cities)
    .innerJoin(prefectures, eq(cities.prefectureId, prefectures.id))
    .where(eq(cities.launchPriority, 'P1'));
}

function scoreCity(city: CityRow, answers: QuizAnswers): number {
  const purpose = answers.purpose as string;
  const season = answers.ski_season as string;
  const family = answers.family_composition as string | undefined;
  const propertyTypes = (answers.property_type as string[]) || [];
  const budget = answers.budget as string;
  const priority = answers.priority as string;

  // Purpose affinity (0-22) — capped so adding family doesn't push >100.
  const purposeMap = PURPOSE_AFFINITY[purpose] || {};
  const purposeScore = Math.min(purposeMap[city.regionType || 'ski_resort'] || 12, 22);

  // Proximity fit (0-22)
  const seasonMax = Math.min(SEASON_WEIGHT[season] || 12, 22);
  let proximityScore: number;
  if (city.carToSlopeMin !== null) {
    if (city.carToSlopeMin <= 15) proximityScore = seasonMax;
    else if (city.carToSlopeMin <= 25) proximityScore = Math.round(seasonMax * 0.8);
    else if (city.carToSlopeMin <= 35) proximityScore = Math.round(seasonMax * 0.65);
    else proximityScore = Math.round(seasonMax * 0.5);
  } else {
    proximityScore = Math.round(seasonMax * 0.6);
  }

  // Property type (0-13) — best match from selected types
  let typeScore = 7; // base if no types match
  for (const pt of propertyTypes) {
    const affinity = Math.min(TYPE_AFFINITY[pt]?.[city.regionType || 'ski_resort'] || 8, 13);
    typeScore = Math.max(typeScore, affinity);
  }

  // Budget (0-13)
  const budgetScore = Math.min(scoreBudget(city, budget), 13);

  // Priority (0-18)
  const priorityScore = Math.min(scorePriority(city, priority), 18);

  // Family composition → municipality culture (0-10). Skipped silently
  // when the user hasn't answered (legacy localStorage from before the
  // question was added, or future quizzes that drop this dimension).
  const familyMap = family ? FAMILY_AFFINITY[family] : null;
  const familyScore = familyMap
    ? familyMap[city.regionType || 'ski_resort'] ?? 6
    : 6;

  // Total out of 98 (purpose 22 + proximity 22 + type 13 + budget 13
  // + priority 18 + family 10). Normalised to /100.
  const raw = purposeScore + proximityScore + typeScore + budgetScore + priorityScore + familyScore;
  return Math.min(Math.round((raw / 98) * 100), 100);
}

function generateExplanation(city: CityRow, answers: QuizAnswers, score: number): string {
  const parts: string[] = [];

  if (city.regionType === 'ski_resort') parts.push('Ski resort area');
  else if (city.regionType === 'onsen_town') parts.push('Traditional onsen town');
  else if (city.regionType === 'mountain_village') parts.push('Mountain village setting');
  else if (city.regionType === 'rural_town') parts.push('Quiet rural town');

  if (city.shuttleBus) {
    parts.push('shuttle bus to slopes');
  }

  if (city.carToSlopeMin !== null) {
    parts.push(`${city.carToSlopeMin} min drive to slopes`);
  }

  if (city.closestStation) {
    const stationName = city.closestStation.split('(')[0].trim();
    parts.push(`${city.stationTimeMin} min from ${stationName} station`);
  }

  const prefix = score >= 75 ? 'Strong match' : score >= 60 ? 'Good fit' : 'Worth exploring';
  return `${prefix}. ${parts.join(', ')}.`;
}

function buildPropertyProfile(answers: QuizAnswers): PropertyProfile {
  const types = (answers.property_type as string[]) || [];
  const condition = answers.condition as string;
  const budget = answers.budget as string;
  const reality = BUDGET_REALITY[budget];

  const typeLabels = types.map((t) => PROPERTY_TYPE_LABELS[t] || t);
  const conditionLabel = CONDITION_LABELS[condition] || condition;

  let summary = `You're looking for ${typeLabels.join(' or ')} in ${conditionLabel} condition.`;
  if (reality) {
    summary += ` At your budget, expect: ${reality.expect}`;
    if (reality.warning) summary += ` Note: ${reality.warning}`;
  }

  return { types, condition, budget, summary };
}

export async function scoreQuiz(answers: QuizAnswers): Promise<{ results: QuizResult[]; profile: PropertyProfile }> {
  const allCities = await getP1CitiesForScoring();

  const scored = allCities.map((city) => ({
    citySlug: city.citySlug,
    cityName: city.cityName,
    prefectureSlug: city.prefectureSlug,
    prefectureName: city.prefectureName,
    regionType: city.regionType ?? null,
    heroImagePath: city.heroImagePath ?? null,
    avgPropertyPriceJpy: city.avgPropertyPriceJpy ?? null,
    timeFromSydney: city.timeFromSydney ?? null,
    timeFromMelbourne: city.timeFromMelbourne ?? null,
    timeFromBrisbane: city.timeFromBrisbane ?? null,
    timeFromPerth: city.timeFromPerth ?? null,
    timeFromAdelaide: city.timeFromAdelaide ?? null,
    offSeasonActivitiesScore: city.offSeasonActivitiesScore ?? null,
    score: scoreCity(city, answers),
    explanation: '',
  }));

  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3);

  const citiesMap = new Map(allCities.map((c) => [c.citySlug, c]));
  for (const result of top3) {
    const city = citiesMap.get(result.citySlug)!;
    result.explanation = generateExplanation(city, answers, result.score);
  }

  const profile = buildPropertyProfile(answers);

  return { results: top3, profile };
}
