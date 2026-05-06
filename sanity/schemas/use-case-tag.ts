import { defineType, defineField } from 'sanity';

export const useCaseTag = defineType({
  name: 'useCaseTag',
  title: 'Use Case Tag',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: (r) => r.required() }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } },
});
