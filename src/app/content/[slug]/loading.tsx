import { MaSkeleton, SkeletonHeading, SkeletonOverline, SkeletonText } from '@/components/japandi/skeleton';

export default function ArticleLoading() {
  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="ma-content mx-auto">
        <MaSkeleton height="h-3" width="w-20" className="mb-ma-8" />
        <SkeletonOverline />
        <div className="mt-ma-4"><SkeletonHeading level={1} /></div>
        <MaSkeleton height="h-3" width="w-32" className="mt-ma-6 mb-ma-12" />
        <SkeletonText lines={8} />
      </div>
    </div>
  );
}
