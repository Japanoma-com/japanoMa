import { MaSkeleton, SkeletonHeading, SkeletonOverline } from '@/components/japandi/skeleton';

export default function CompareLoading() {
  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="max-w-[960px] mx-auto">
        <SkeletonOverline />
        <div className="mt-ma-4"><SkeletonHeading level={1} /></div>
        <div className="mt-ma-12 grid grid-cols-3 gap-ma-4">
          {[1,2,3].map(i => (
            <MaSkeleton key={i} height="h-64" className="rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
