'use client';

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export function useSeason(): Season {
  const month = new Date().getMonth(); // 0-indexed
  if (month >= 11 || month <= 2) return 'winter';   // Dec-Mar
  if (month >= 3 && month <= 4) return 'spring';     // Apr-May
  if (month >= 5 && month <= 8) return 'summer';     // Jun-Sep
  return 'autumn';                                     // Oct-Nov
}
