import { MaSkeleton, SkeletonHeading, SkeletonOverline } from '@/components/japandi/skeleton';

export default function QuizLoading() {
  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="ma-content mx-auto">
        <SkeletonOverline />
        <div className="flex gap-1 mt-ma-8">
          {[1,2,3,4].map(i => (
            <MaSkeleton key={i} height="h-[3px]" className="flex-1 rounded-full" />
          ))}
        </div>
        <div className="mt-ma-16">
          <SkeletonHeading level={2} />
          <MaSkeleton height="h-3" width="w-48" className="mt-ma-3" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-ma-3 mt-ma-12">
          {[1,2,3,4].map(i => (
            <MaSkeleton key={i} height="h-20" className="rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
