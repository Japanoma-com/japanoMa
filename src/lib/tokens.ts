// Ma Space v4 design tokens as TypeScript constants
// Used for Recharts theming and any JS-side token access

export const colors = {
  sumi: '#1A1816',
  sumiLight: '#3D3833',
  stone: '#8A8279',
  ash: '#C4BDB4',
  washi: '#F5F0E8',
  shoji: '#FAFAF7',
  kinu: '#FFFFFF',
  border: '#E5E0D8',
  matsu: '#4A6B52',
  kohaku: '#A67B3D',
  beni: '#8B3A3A',
  ai: '#3D5A7A',
  aiDeep: '#2C4562',
} as const;

export const chartColors = [
  colors.ai,
  colors.matsu,
  colors.kohaku,
  colors.beni,
  colors.stone,
] as const;

export const rechartsTheme = {
  fontFamily: 'Satoshi, sans-serif',
  fontSize: 12,
  colors: chartColors,
  tooltip: {
    backgroundColor: colors.shoji,
    borderColor: colors.border,
    textColor: colors.sumiLight,
  },
  grid: {
    stroke: colors.border,
    strokeDasharray: '3 3',
  },
  axis: {
    stroke: colors.ash,
    tickColor: colors.stone,
    fontSize: 11,
  },
} as const;
