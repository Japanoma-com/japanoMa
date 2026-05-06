import { defineType, defineField } from 'sanity';

export const phaseTag = defineType({
  name: 'phaseTag',
  title: 'Phase Tag',
  type: 'document',
  fields: [
    defineField({
      name: 'phaseId',
      title: 'Phase ID',
      type: 'string',
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({ name: 'title', title: 'Title (internal)', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'userLabel', title: 'User-facing Label', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'order', title: 'Order', type: 'number', readOnly: true }),
    defineField({ name: 'description', title: 'Description (editable)', type: 'text', rows: 3 }),
    defineField({ name: 'icon', title: 'Icon', type: 'image', options: { hotspot: false } }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'phaseId' },
  },
});
