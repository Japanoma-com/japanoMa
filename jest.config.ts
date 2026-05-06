import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'esnext',
        moduleResolution: 'bundler',
        esModuleInterop: true,
        strict: true,
        paths: {
          '@/*': ['./src/*'],
        },
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // next/cache transitively pulls in Next.js server specs (Request, Response,
    // Headers, TextEncoder, etc.) that jsdom doesn't provide. Client components
    // that import server actions end up loading this chain even though the
    // client bundle would normally tree-shake it. Stub it for tests.
    '^next/cache$': '<rootDir>/src/test-mocks/next-cache.ts',
    // 'server-only' throws on import in any non-server bundle. Jest's jsdom
    // looks like a client to it. Stub for tests; real boundary is enforced
    // at build time by Next.js.
    '^server-only$': '<rootDir>/src/test-mocks/server-only.ts',
    // cheerio v1 + the unified/remark/rehype stack ship ESM with bare-spec
    // imports that Jest's CJS transform can't parse. Their callers only run
    // server-side at request time and are never exercised by unit tests
    // (integration tests mock the fetch/render paths). Stub the imports so
    // smoke tests that transitively load the journey actions don't blow up.
    '^cheerio$': '<rootDir>/src/test-mocks/cheerio.ts',
    '^unified$': '<rootDir>/src/test-mocks/unified.ts',
    '^remark-parse$': '<rootDir>/src/test-mocks/empty.ts',
    '^remark-rehype$': '<rootDir>/src/test-mocks/empty.ts',
    '^rehype-sanitize$': '<rootDir>/src/test-mocks/empty.ts',
    '^rehype-stringify$': '<rootDir>/src/test-mocks/empty.ts',
  },
  setupFiles: ['<rootDir>/src/test-setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/', '/.worktrees/', '/e2e/'],
};

export default config;
