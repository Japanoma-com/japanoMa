/**
 * Jest stub for next/cache. The real module pulls in Next.js server internals
 * (Request, Response, Headers, TextEncoder, etc.) that jsdom doesn't provide.
 * Client components that import server actions end up importing this module
 * transitively; this stub keeps the import resolvable in tests without pulling
 * in the server runtime.
 *
 * Mapped via moduleNameMapper in jest.config.ts.
 */

export const revalidatePath = (..._args: unknown[]): void => {
  void _args;
};

export const revalidateTag = (..._args: unknown[]): void => {
  void _args;
};

export const unstable_cache = <T extends (...args: unknown[]) => unknown>(fn: T): T => fn;

export const unstable_noStore = (): void => {};
