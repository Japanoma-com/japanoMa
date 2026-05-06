// src/test-mocks/unified.ts
// Minimal stub for the unified pipeline used by markdown.ts. The chain is
// .use(...).use(...).process(input) → returns something stringifiable.
type Processor = {
  use: () => Processor;
  process: (input: string) => Promise<string>;
};
const processor: Processor = {
  use: () => processor,
  process: async (input: string) => input,
};
export const unified = () => processor;
export default { unified };
