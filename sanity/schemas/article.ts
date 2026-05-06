import { defineType, defineField } from 'sanity';

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
    defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', rows: 3 }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Heading 4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
        },
        { type: 'image', options: { hotspot: true } },
      ],
    }),
    defineField({ name: 'featuredImage', title: 'Featured Image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'areaTags',
      title: 'Area Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'areaTag' }] }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'propertyTypeTags',
      title: 'Property Type Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'propertyTypeTag' }] }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'useCaseTags',
      title: 'Use Case Tags',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'useCaseTag' }] }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'phase',
      title: 'Phase',
      type: 'reference',
      to: [{ type: 'phaseTag' }],
      description: 'Decision-to-Living phase this article serves.',
    }),
    defineField({
      name: 'buyerTypes',
      title: 'Buyer Types',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'buyerTypeTag' }] }],
      options: { layout: 'tags' },
      description: 'Which buyer types this content is most relevant for.',
    }),
    defineField({
      name: 'phaseSuggested',
      title: 'Phase (heuristic suggestion — for backfill review)',
      type: 'reference',
      to: [{ type: 'phaseTag' }],
      hidden: ({ document }) => !!document?.phase,
      readOnly: true,
    }),
    defineField({
      name: 'buyerTypesSuggested',
      title: 'Buyer Types (heuristic suggestion — for backfill review)',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'buyerTypeTag' }] }],
      hidden: ({ document }) => Array.isArray(document?.buyerTypes) && document.buyerTypes.length > 0,
      readOnly: true,
    }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'title', media: 'featuredImage' },
  },
});
