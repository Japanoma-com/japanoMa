export type DifficultyLevel = 'easy' | 'moderate' | 'involved' | 'challenging' | 'advanced';

export type QuizAnswer = {
  id: string;
  label: string;
  description?: string;
  difficulty?: {
    level: DifficultyLevel;
    label: string;
  };
};

export type QuizQuestion = {
  id: string;
  title: string;
  subtitle?: string;
  answers: QuizAnswer[];
  multiSelect?: boolean;
  maxSelections?: number;
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'purpose',
    title: 'Why are you considering buying in Japan?',
    subtitle: 'This shapes everything, from area to property type',
    answers: [
      { id: 'holiday', label: 'Holiday Home', description: 'Seasonal family use, a base for annual trips' },
      { id: 'ski-base', label: 'Ski Base', description: 'Dedicated ski season property near slopes' },
      { id: 'year-round', label: 'Year-Round Living', description: 'Retirement, relocation, or remote work base' },
      { id: 'investment', label: 'Investment', description: 'Rental yield focus, managed remotely' },
      { id: 'lifestyle-income', label: 'Lifestyle + Income', description: 'Personal use plus rental when away' },
    ],
  },
  {
    id: 'ski_season',
    title: 'What does your ski season look like?',
    subtitle: 'Your rhythm shapes which areas make sense',
    answers: [
      { id: 'weekend', label: 'Weekend Warrior', description: '2 to 5 days, mostly domestic trips' },
      { id: 'annual', label: 'Annual Pilgrimage', description: '7 to 14 days, one big trip per year' },
      { id: 'regular', label: 'Season Regular', description: '15 to 30 days, multiple trips' },
      { id: 'full', label: 'Full Season', description: '30+ days, based there for winter' },
    ],
  },
  {
    id: 'family_composition',
    title: 'Who will be using the property?',
    subtitle:
      'Japanese municipalities have distinct cultures — quiet retirement towns, family-friendly resort villages, traditional multi-generational communities. We use this to match you to places where you\'ll feel at home.',
    answers: [
      { id: 'solo', label: 'Solo', description: 'Just me — flexible, can settle anywhere' },
      { id: 'couple', label: 'Couple', description: 'Two of us, no kids at home' },
      { id: 'young_family', label: 'Family with young kids', description: 'School-age children, family-oriented community matters' },
      { id: 'teen_family', label: 'Family with teens', description: 'Older kids, transport links and activities matter' },
      { id: 'empty_nest', label: 'Empty nest', description: 'Kids grown up — quieter pace, slower towns appeal' },
      { id: 'multi_gen', label: 'Multi-generational', description: 'Parents or in-laws joining us — traditional villages welcome this' },
    ],
  },
  {
    id: 'property_type',
    title: 'What type of property interests you?',
    subtitle: 'Select up to 3 that appeal to you',
    multiSelect: true,
    maxSelections: 3,
    answers: [
      { id: 'detached', label: 'Detached House', description: 'Standalone home with land' },
      { id: 'apartment', label: 'Apartment / Condo', description: 'Managed building, lower entry' },
      { id: 'akiya', label: 'Akiya (Vacant Home)', description: 'Renovation project, lowest price' },
      { id: 'land', label: 'Land Only', description: 'Build custom from scratch' },
      { id: 'kominka', label: 'Kominka (Heritage Home)', description: 'Traditional Japanese farmhouse' },
    ],
  },
  {
    id: 'condition',
    title: 'How much work are you comfortable with?',
    subtitle: 'This affects price, timeline, and risk',
    answers: [
      { id: 'as-is', label: 'As-Is', description: 'No inspection. Full control, full risk. Cheapest entry.', difficulty: { level: 'advanced', label: 'Most hands-on' } },
      { id: 'inspected', label: 'Inspected + Warranty', description: 'Professionally checked. You control renovation.', difficulty: { level: 'challenging', label: 'Renovation required' } },
      { id: 'reform-included', label: 'Inspected + Reform Included', description: 'Wet areas modernised. Cost in the price.', difficulty: { level: 'moderate', label: 'Some waiting' } },
      { id: 'turnkey', label: 'Turnkey Ready', description: 'Inspected, reformed, move-in ready. Premium price.', difficulty: { level: 'easy', label: 'Move-in ready' } },
      { id: 'new-build', label: 'New Build', description: 'Modern construction with full warranty.', difficulty: { level: 'easy', label: 'Brand new' } },
    ],
  },
  {
    id: 'budget',
    title: 'What\'s your budget range?',
    subtitle: 'Purchase price. We\'ll show you what this buys.',
    answers: [
      { id: 'under-15m', label: 'Under A$135K (¥15M)', description: 'Rural akiya, renovation projects. Expect A$27K to A$72K additional renovation.' },
      { id: '15-30m', label: 'A$135K to A$270K (¥15M to ¥30M)', description: 'Detached houses near ski areas. Most accessible entry point.' },
      { id: '30-50m', label: 'A$270K to A$450K (¥30M to ¥50M)', description: 'Established resort areas. Better infrastructure, higher resale.' },
      { id: '50m+', label: 'A$450K+ (¥50M+)', description: 'Premium locations, newer builds, or large properties.' },
    ],
  },
  {
    id: 'priority',
    title: 'What matters most to you?',
    subtitle: 'When two areas score equally, this tips the balance',
    answers: [
      { id: 'slopes', label: 'Closest to Slopes', description: 'Shuttle bus access, short drive times' },
      { id: 'onsen', label: 'Onsen + Hot Spring Culture', description: 'Traditional bathing, year-round relaxation' },
      { id: 'affordable', label: 'Affordability + Value', description: 'Lower demand areas, more for your money' },
      { id: 'four-seasons', label: 'Year-Round Lifestyle', description: 'Summer hiking, autumn foliage, not just winter' },
    ],
  },
];

export const TOTAL_STEPS = QUIZ_QUESTIONS.length;

export const CONDITION_LABELS: Record<string, string> = {
  'as-is': 'As-Is (No Inspection)',
  'inspected': 'Inspected + Warranty',
  'reform-included': 'Inspected + Reform Included',
  'turnkey': 'Turnkey Ready',
  'new-build': 'New Build',
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  'detached': 'Detached House',
  'apartment': 'Apartment / Condo',
  'akiya': 'Akiya (Vacant Home)',
  'land': 'Land Only',
  'kominka': 'Kominka (Heritage Home)',
};

export const BUDGET_REALITY: Record<string, { what: string; expect: string; warning?: string }> = {
  'under-15m': {
    what: 'Rural akiya (vacant homes), older detached houses in non-resort areas',
    expect: 'Renovation budget of A$27K to A$72K (¥3M to ¥8M) on top. Properties may need structural work.',
    warning: 'Inspection is critical. Many akiya have hidden issues like moisture, wiring, and snow load.',
  },
  '15-30m': {
    what: 'Detached houses or apartments near ski areas in Nagano and Niigata',
    expect: 'Most common entry point for Australian buyers. Light renovation may be needed.',
  },
  '30-50m': {
    what: 'Established resort-area properties, reformed homes, or newer apartments',
    expect: 'Better infrastructure, closer to lifts, higher resale potential.',
  },
  '50m+': {
    what: 'Premium resort locations, new builds, large detached homes, or land + custom build',
    expect: 'Widest selection. Can be selective on condition, location, and style.',
  },
};

/** Exchange rate used for AUD conversions (approximate, March 2026) */
export const JPY_AUD_RATE = 111;
