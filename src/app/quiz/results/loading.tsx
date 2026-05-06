import { MaSkeleton, SkeletonHeading, SkeletonOverline, SkeletonText } from '@/components/japandi/skeleton';

export default function ResultsLoading() {
  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="ma-content mx-auto">
        <SkeletonOverline />
        <div className="mt-ma-4"><SkeletonHeading level={1} /></div>
        <div className="mt-ma-6"><SkeletonText lines={2} /></div>
        <div className="my-ma-12 h-px bg-border" />
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-ma-8 mb-ma-12">
            <MaSkeleton height="h-24" width="w-24" className="rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <SkeletonHeading level={2} />
              <div className="mt-ma-4"><SkeletonText lines={2} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
