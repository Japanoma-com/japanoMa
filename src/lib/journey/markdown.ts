// src/lib/journey/markdown.ts
// Sanitized markdown → HTML for journey notes.
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';

const sanitizeSchema = {
  ...defaultSchema,
  protocols: { ...defaultSchema.protocols, href: ['https'] },
  tagNames: (defaultSchema.tagNames ?? []).filter(
    (t) => !['script', 'iframe', 'style', 'object', 'embed'].includes(t)
  ),
};

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype)
  .use(rehypeSanitize, sanitizeSchema)
  .use(rehypeStringify);

export async function renderMarkdown(source: string): Promise<string> {
  const file = await processor.process(source);
  return String(file)
    // Disable any non-https links the sanitizer let through
    .replace(/<a (?!href="https:)/g, '<a aria-disabled="true" ')
    // Force https links open in new tab with safe rel
    .replace(/<a href="(https:[^"]+)"/g, '<a href="$1" target="_blank" rel="noopener noreferrer ugc"');
}
