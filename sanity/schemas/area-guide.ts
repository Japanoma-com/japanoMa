import { defineType, defineField } from 'sanity';

export const areaGuide = defineType({
  name: 'areaGuide',
  title: 'Area Guide',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'name' }, validation: (r) => r.required() }),
    defineField({ name: 'prefectureSlug', title: 'Prefecture Slug', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text' }),
    defineField({ name: 'images', title: 'Images', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }),
    defineField({ name: 'climateInfo', title: 'Climate Info', type: 'text' }),
    defineField({ name: 'accessInfo', title: 'Access Info', type: 'text' }),
    defineField({ name: 'propertyOverview', title: 'Property Overview', type: 'text' }),
    defineField({ name: 'tags', title: 'Tags', type: 'array', of: [{ type: 'string' }] }),
  ],
  preview: {
    select: { title: 'name' },
  },
});
