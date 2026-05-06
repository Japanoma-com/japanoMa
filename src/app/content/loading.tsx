import { MaSkeleton, SkeletonHeading, SkeletonOverline } from '@/components/japandi/skeleton';

export default function ContentLoading() {
  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="ma-content mx-auto">
        <SkeletonOverline />
        <div className="mt-ma-4"><SkeletonHeading level={1} /></div>
        <div className="mt-ma-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-ma-4">
          {[1,2,3,4,5,6].map(i => (
            <MaSkeleton key={i} height="h-40" className="rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
