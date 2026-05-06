/**
 * Global loading fallback — the breathing 間 character.
 * Shows during route transitions when no page-specific loading.tsx exists.
 */
export default function GlobalLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <p
          className="font-editorial text-[clamp(80px,15vw,160px)] leading-none text-sumi/[0.06] ma-skeleton select-none"
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          aria-hidden="true"
        >
          間
        </p>
        <p className="mt-ma-4 text-sm text-stone/60 tracking-wider uppercase">
          Loading
        </p>
      </div>
    </div>
  );
}
