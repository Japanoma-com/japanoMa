import { defineType, defineField } from 'sanity';

export const buyerTypeTag = defineType({
  name: 'buyerTypeTag',
  title: 'Buyer Type Tag',
  type: 'document',
  fields: [
    defineField({
      name: 'buyerTypeId',
      title: 'Buyer Type ID',
      type: 'string',
      readOnly: true,
      validation: (r) => r.required(),
    }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'buyerTypeId' },
  },
});
