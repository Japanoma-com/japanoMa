import { notFound } from 'next/navigation';
import { PortableText, type PortableTextComponents } from '@portabletext/react';
import { getArticleBySlug, getRelatedArticles } from '@/lib/sanity/queries';
import { ArticleCard } from '@/components/content/article-card';
import { Badge } from '@/components/ui/badge';
import { MaDivider, ScrollReveal, SaveButton } from '@/components/japandi';
import { breadcrumbJsonLd, articleJsonLd } from '@/lib/seo/json-ld';
import { urlFor } from '@/lib/sanity/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSavedKeys } from '@/app/account/save-actions';
import { logEvent } from '@/lib/events/log';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    if (!article) return {};
    return {
      title: article.title,
      description: article.excerpt || `Read about ${article.title} on JapanoMa.`,
      alternates: { canonical: `/content/${slug}` },
    };
  } catch {
    return {};
  }
}

export const dynamic = 'force-dynamic';

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }: { value: { asset?: { _ref: string }; alt?: string } }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-ma-8 -mx-ma-6 sm:mx-0">
          <img
            src={urlFor(value as { asset: { _ref: string } }).width(1360).auto('format').url()}
            alt={value.alt || ''}
            className="w-full h-auto rounded-lg"
          />
        </figure>
      );
    },
  },
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  let article;
  try {
    article = await getArticleBySlug(slug);
  } catch {
    notFound();
  }
  if (!article) notFound();

  type TagRef = { title: string; slug: string };
  // Defensive filter — legacy string tags dereference to null via GROQ's `->` operator
  const toTags = (arr: unknown): TagRef[] =>
    Array.isArray(arr) ? arr.filter((t): t is TagRef => !!t && typeof t === 'object' && 'title' in t) : [];
  const areaTags = toTags(article.areaTags);
  const propertyTypeTags = toTags(article.propertyTypeTags);
  const useCaseTags = toTags(article.useCaseTags);
  const allTagTitles = [
    ...areaTags.map((t) => t.title),
    ...propertyTypeTags.map((t) => t.title),
    ...useCaseTags.map((t) => t.title),
  ];
  const related = allTagTitles.length > 0
    ? await getRelatedArticles(slug, allTagTitles)
    : [];

  // Auth state + saved-set lookup for the SaveButton initial state
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isAuthenticated = !!user;
  const savedKeys = isAuthenticated ? await getCurrentUserSavedKeys() : new Set<string>();
  const initialSaved = savedKeys.has(`article:${slug}`);

  // Track article read (consent-gated inside logEvent; non-blocking).
  void logEvent('article_read', { slug, title: article.title }, user?.id ?? null);

  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            articleJsonLd({ title: article.title, slug, excerpt: article.excerpt, publishedAt: article.publishedAt }),
            breadcrumbJsonLd([
              { name: 'Home', href: '/' },
              { name: 'Content', href: '/content' },
              { name: article.title, href: `/content/${slug}` },
            ]),
          ]),
        }}
      />

      <div className="ma-content mx-auto">
        <nav className="mb-ma-8 text-sm text-stone">
          <Link href="/content" className="hover:text-sumi-light transition-colors duration-base ease-settle">
            Content
          </Link>
          <span className="mx-ma-2">/</span>
          <span className="text-sumi-light">{article.title}</span>
        </nav>

        {/* Hero image */}
        {article.featuredImage && (
          <ScrollReveal>
            <div className="rounded-lg overflow-hidden mb-ma-12 -mx-ma-6 sm:mx-0">
              <img
                src={urlFor(article.featuredImage).width(1360).auto('format').url()}
                alt={article.title}
                className="w-full h-48 sm:h-64 md:h-72 object-cover object-center"
              />
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal>
          {(areaTags.length > 0 || propertyTypeTags.length > 0 || useCaseTags.length > 0) && (
            <div className="flex gap-ma-2 flex-wrap mb-ma-4">
              {areaTags.map((tag) => (
                <Link key={`area-${tag.slug}`} href={`/content?area=${encodeURIComponent(tag.slug)}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-ai/10">{tag.title}</Badge>
                </Link>
              ))}
              {propertyTypeTags.map((tag) => (
                <Link key={`pt-${tag.slug}`} href={`/content?type=${encodeURIComponent(tag.slug)}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-ai/10">{tag.title}</Badge>
                </Link>
              ))}
              {useCaseTags.map((tag) => (
                <Link key={`uc-${tag.slug}`} href={`/content?use=${encodeURIComponent(tag.slug)}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-ai/10">{tag.title}</Badge>
                </Link>
              ))}
            </div>
          )}
          <h1 className="mb-ma-6">{article.title}</h1>
          {article.publishedAt && (
            <p className="text-sm text-stone mb-ma-6">
              {new Date(article.publishedAt).toLocaleDateString('en-AU', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
          <div className="mb-ma-12">
            <SaveButton
              contentType="article"
              contentId={slug}
              title={article.title}
              href={`/content/${slug}`}
              isAuthenticated={isAuthenticated}
              initialSaved={initialSaved}
            />
          </div>
        </ScrollReveal>

        <div className="prose-japanoma">
          {article.body && <PortableText value={article.body} components={portableTextComponents} />}
        </div>

        {related.length > 0 && (
          <>
            <MaDivider size="zone" line />
            <ScrollReveal>
              <p className="label-overline text-stone mb-ma-4">Related</p>
              <h2 className="mb-ma-8">You might also like</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-ma-4">
              {related.map((r: { _id: string; title: string; slug: { current: string }; excerpt?: string; publishedAt?: string; areaTags?: string[]; featuredImage?: { asset: { _ref: string } } }) => (
                <ScrollReveal key={r._id}>
                  <ArticleCard
                    title={r.title}
                    slug={r.slug.current}
                    excerpt={r.excerpt}
                    publishedAt={r.publishedAt}
                    areaTags={r.areaTags}
                    featuredImage={r.featuredImage}
                  />
                </ScrollReveal>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
