/**
 * Shared loading UI for every admin route. Renders a skeleton that
 * matches the typical shape — header row, stat grid, body content —
 * so route transitions (including date-range changes) feel smooth
 * instead of flashing blank.
 *
 * Individual pages can override by dropping their own loading.tsx
 * next to the page.tsx.
 */
export default function AdminLoading() {
  return (
    <div className="space-y-ma-12 animate-pulse">
      {/* Header row */}
      <div className="flex items-start justify-between gap-ma-6 flex-wrap">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-border rounded-sm" />
          <div className="h-8 w-64 bg-border rounded-md" />
          <div className="h-3 w-48 bg-border/60 rounded-sm" />
        </div>
        <div className="h-9 w-40 bg-border rounded-md" />
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-ma-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-shoji border border-border rounded-lg p-ma-6 h-28"
          />
        ))}
      </div>

      {/* Body rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-ma-6">
        <div className="bg-shoji border border-border rounded-lg h-72 lg:col-span-2" />
        <div className="bg-shoji border border-border rounded-lg h-72" />
      </div>
    </div>
  );
}
