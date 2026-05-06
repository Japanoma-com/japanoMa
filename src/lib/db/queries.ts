import { db } from './index';
import { cities, prefectures } from './schema';
import { eq, and, sql } from 'drizzle-orm';

export async function getP1Cities() {
  return db
    .select({
      citySlug: cities.slug,
      cityName: cities.nameEn,
      cityNameJa: cities.nameJa,
      regionType: cities.regionType,
      prefectureSlug: prefectures.slug,
      prefectureName: prefectures.nameEn,
    })
    .from(cities)
    .innerJoin(prefectures, eq(cities.prefectureId, prefectures.id))
    .where(eq(cities.launchPriority, 'P1'))
    .orderBy(prefectures.nameEn, cities.nameEn);
}

/**
 * Areas shown on the public directory — P1 Launch only. Later phases
 * stay in the DB for future releases but aren't surfaced in the UI;
 * launch priority is an internal concept, not user-facing. Ordering
 * groups by prefecture, alphabetical within.
 */
export async function getAreasDirectory() {
  return db
    .select({
      citySlug: cities.slug,
      cityName: cities.nameEn,
      cityNameJa: cities.nameJa,
      regionType: cities.regionType,
      prefectureSlug: prefectures.slug,
      prefectureName: prefectures.nameEn,
      prefectureNameJa: prefectures.nameJa,
      avgPropertyPriceJpy: cities.avgPropertyPriceJpy,
      offSeasonActivitiesScore: cities.offSeasonActivitiesScore,
      timeFromSydney: cities.timeFromSydney,
      timeFromMelbourne: cities.timeFromMelbourne,
      timeFromBrisbane: cities.timeFromBrisbane,
      timeFromPerth: cities.timeFromPerth,
      timeFromAdelaide: cities.timeFromAdelaide,
      closestAirport: cities.closestAirport,
      notes: cities.notes,
      heroImagePath: cities.heroImagePath,
      population: cities.population,
      municipalityUrl: cities.municipalityUrl,
      latitude: cities.latitude,
      longitude: cities.longitude,
    })
    .from(cities)
    .innerJoin(prefectures, eq(cities.prefectureId, prefectures.id))
    .where(eq(cities.launchPriority, 'P1'))
    .orderBy(prefectures.sortOrder, cities.nameEn);
}

export async function getCityBySlug(prefectureSlug: string, citySlug: string) {
  const [result] = await db
    .select({
      cityId: cities.id,
      citySlug: cities.slug,
      cityName: cities.nameEn,
      cityNameJa: cities.nameJa,
      description: cities.description,
      regionType: cities.regionType,
      launchPriority: cities.launchPriority,
      closestAirport: cities.closestAirport,
      airportTimeMin: cities.airportTimeMin,
      closestStation: cities.closestStation,
      stationTimeMin: cities.stationTimeMin,
      notes: cities.notes,
      heroImagePath: cities.heroImagePath,
      // CRA-76 AU buyer fields
      timeFromSydney: cities.timeFromSydney,
      timeFromMelbourne: cities.timeFromMelbourne,
      timeFromBrisbane: cities.timeFromBrisbane,
      timeFromPerth: cities.timeFromPerth,
      timeFromAdelaide: cities.timeFromAdelaide,
      avgPropertyPriceJpy: cities.avgPropertyPriceJpy,
      offSeasonActivitiesScore: cities.offSeasonActivitiesScore,
      prefectureSlug: prefectures.slug,
      prefectureName: prefectures.nameEn,
      prefectureNameJa: prefectures.nameJa,
      population: cities.population,
      municipalityUrl: cities.municipalityUrl,
    })
    .from(cities)
    .innerJoin(prefectures, eq(cities.prefectureId, prefectures.id))
    .where(
      and(
        eq(prefectures.slug, prefectureSlug),
        eq(cities.slug, citySlug)
      )
    )
    .limit(1);

  return result ?? null;
}

export async function getAllCitySlugs() {
  return db
    .select({
      citySlug: cities.slug,
      prefectureSlug: prefectures.slug,
    })
    .from(cities)
    .innerJoin(prefectures, eq(cities.prefectureId, prefectures.id))
    .where(eq(cities.launchPriority, 'P1'));
}
