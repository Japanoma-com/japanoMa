import Link from 'next/link';
import type { SavedItem } from '@/lib/account/queries';
import { ButtonLink } from '@/components/ui/button-link';
import { SavedItemRemoveButton } from './saved-item-remove-button';

type Props = {
  items: SavedItem[];
};

/**
 * Renders the "Your saved items" section on /account. Groups by content
 * type (Areas first, then Guides) and renders each item as a card-styled
 * row that links to the detail page, with a small remove button next to
 * it. Shows a calm empty state when nothing is saved.
 *
 * Visual convention matches the ContentCard pattern (bg-shoji + shadow +
 * rounded-xl + hover lift) used elsewhere on the site, and uses ButtonLink
 * for the empty-state CTAs so they match the shadcn homescreen buttons
 * exactly.
 */
export function SavedItemsSection({ items }: Props) {
  const areas = items.filter((i) => i.contentType === 'city');
  const guides = items.filter((i) => i.contentType === 'article');

  return (
    <section className="mb-ma-16">
      <p className="label-overline text-stone mb-ma-2">Saved</p>
      <h2 className="font-editorial text-2xl text-sumi leading-tight mb-ma-2">
        Your saved items
      </h2>
      <p className="text-sm text-sumi-light leading-relaxed mb-ma-6 max-w-md">
        {items.length > 0
          ? `${items.length} ${items.length === 1 ? 'item' : 'items'} across areas and guides.`
          : 'Bookmark areas and guides from the rest of the site — they show up here.'}
      </p>

      {items.length === 0 ? (
        <div className="bg-shoji/40 rounded-xl p-ma-12 text-center">
          <p className="mb-ma-6 text-sm text-stone leading-relaxed max-w-[360px] mx-auto">
            Nothing saved yet. Tap the save icon as you explore — it shows up here.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-ma-3">
            <ButtonLink href="/areas" variant="default" size="default">
              Explore areas
            </ButtonLink>
            <ButtonLink href="/content" variant="outline" size="default">
              Browse guides
            </ButtonLink>
          </div>
        </div>
      ) : (
        <div className="space-y-ma-6">
          {areas.length > 0 && <SavedGroup label="Areas" items={areas} />}
          {guides.length > 0 && <SavedGroup label="Guides" items={guides} />}
        </div>
      )}
    </section>
  );
}

function SavedGroup({ label, items }: { label: string; items: SavedItem[] }) {
  return (
    <div>
      <p className="text-[10px] font-ui font-semibold uppercase tracking-[0.15em] text-stone mb-ma-3">
        {label}
      </p>
      <div className="grid gap-ma-2">
        {items.map((item) => (
          <SavedRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function SavedRow({ item }: { item: SavedItem }) {
  const now = new Date();
  const savedDate = item.createdAt.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: item.createdAt.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });

  return (
    <div className="group relative bg-kinu rounded-lg shadow-card transition-[box-shadow,transform] duration-slow ease-settle hover:-translate-y-[1px] hover:shadow-[0_8px_24px_rgba(26,24,22,0.08)]">
      <Link
        href={item.href}
        className="block px-ma-4 py-ma-3 pr-ma-12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ai/40 focus-visible:ring-offset-2 focus-visible:ring-offset-washi rounded-lg"
      >
        <p className="text-sm font-ui font-medium text-sumi group-hover:text-ai transition-colors duration-base ease-settle truncate">
          {item.title}
        </p>
        <p className="mt-0.5 text-[11px] text-stone tabular-nums">Saved {savedDate}</p>
      </Link>
      <div className="absolute top-1/2 right-ma-3 -translate-y-1/2">
        <SavedItemRemoveButton
          contentType={item.contentType}
          contentId={item.contentId}
          title={item.title}
          href={item.href}
        />
      </div>
    </div>
  );
}
