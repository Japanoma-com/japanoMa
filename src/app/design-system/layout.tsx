export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-ai focus:text-kinu focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>
      <div id="main-content">{children}</div>
    </>
  );
}
