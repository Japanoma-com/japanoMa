// src/test-mocks/server-only.ts
// 'server-only' throws at import time when loaded by a client bundle. In
// Jest (jsdom), every module looks like a "client" — so we stub it out.
// Modules guarded with this import are still safe in production because
// Next.js handles the real client/server boundary at build time.
export {};
