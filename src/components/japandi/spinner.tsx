/**
 * Small inline loading spinner. SVG + animate-spin, scales with currentColor
 * so it inherits the parent text color naturally. Used in buttons and other
 * loading-feedback spots across the site.
 *
 * Sizes map to Tailwind's size-X utilities: sm=12px, md=16px, lg=20px.
 */

type SpinnerProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClass = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin ${sizeClass[size]} ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
