import {
  SkeletonHeading,
  SkeletonOverline,
  SkeletonText,
  SkeletonAreaRow,
} from '@/components/japandi/skeleton';

/**
 * Areas listing skeleton — matches the real page layout.
 */
export default function AreasLoading() {
  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="ma-content mx-auto">
        <SkeletonOverline />
        <div className="mt-ma-4">
          <SkeletonHeading level={1} />
        </div>
        <div className="mt-ma-6">
          <SkeletonText lines={2} />
        </div>
      </div>

      {/* Prefecture group 1 */}
      <div className="ma-content mx-auto mt-ma-16">
        <SkeletonHeading level={2} />
        <div className="mt-ma-8">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonAreaRow key={i} />
          ))}
        </div>
      </div>

      {/* Prefecture group 2 */}
      <div className="ma-content mx-auto mt-ma-16">
        <SkeletonHeading level={2} />
        <div className="mt-ma-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonAreaRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
