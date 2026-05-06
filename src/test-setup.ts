// next/cache transitively requires TextEncoder/TextDecoder via Next.js's
// web-streams polyfills. jsdom does not ship those, so tests that import
// modules which call revalidatePath/revalidateTag fail at module load.
// Polyfill both in the global scope regardless of the test environment.
import { TextEncoder, TextDecoder } from 'util';
if (typeof globalThis.TextEncoder === 'undefined') {
  (globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  (globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;
}

// Guarded so tests declaring `@jest-environment node` (where `window` is
// undefined) can still run. jsdom tests still get the matchMedia mock.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  // jsdom does not ship IntersectionObserver. The ScrollReveal component
  // uses it to trigger the reveal animation; in tests we just no-op so the
  // component mounts cleanly and its children render normally.
  if (typeof window.IntersectionObserver === 'undefined') {
    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    }
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
  }
}
