// src/test-mocks/empty.ts
// No-op default export for ESM packages stubbed in jest.config moduleNameMapper.
const noop = () => noop;
export default noop;
export { noop };
export const defaultSchema = {};
