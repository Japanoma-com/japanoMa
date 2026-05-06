// src/test-mocks/cheerio.ts
// cheerio v1+ is ESM-only and uses bare specifiers that Jest's CJS transform
// can't parse (see jest.config moduleNameMapper). The OG fetcher is the only
// caller; it never runs in tests. Stub with a noop API surface that satisfies
// TypeScript and any test that happens to import it transitively.
type CheerioApiStub = (() => CheerioApiStub) & {
  attr: () => null;
  text: () => string;
};

const stub: CheerioApiStub = Object.assign(
  () => stub,
  {
    attr: () => null,
    text: () => '',
  }
);

export const load = () => stub;
export default { load };
