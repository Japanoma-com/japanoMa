import {
  MaSkeleton,
  SkeletonHeading,
  SkeletonOverline,
  SkeletonText,
} from '@/components/japandi/skeleton';

/**
 * Area detail skeleton — matches city detail page layout.
 */
export default function CityDetailLoading() {
  return (
    <div className="ma-page px-ma-6 py-ma-24">
      <div className="ma-content mx-auto">
        {/* Breadcrumb */}
        <div className="mb-ma-8 flex items-center gap-ma-2">
          <MaSkeleton height="h-3" width="w-12" />
          <span className="text-stone">/</span>
          <MaSkeleton height="h-3" width="w-16" />
          <span className="text-stone">/</span>
          <MaSkeleton height="h-3" width="w-24" />
        </div>

        {/* Header */}
        <SkeletonOverline />
        <div className="mt-ma-3">
          <SkeletonHeading level={1} />
        </div>
        <MaSkeleton height="h-5" width="w-24" className="mt-ma-3 opacity-50" />

        {/* Description */}
        <div className="mt-ma-12">
          <SkeletonText lines={3} />
        </div>

        {/* Divider */}
        <div className="my-ma-16 h-px bg-bamboo/30" />

        {/* Access section */}
        <SkeletonHeading level={2} />
        <div className="mt-ma-8 grid gap-ma-6 sm:grid-cols-2">
          <div>
            <SkeletonOverline />
            <MaSkeleton height="h-4" width="w-40" className="mt-ma-2" />
            <MaSkeleton height="h-3" width="w-16" className="mt-ma-1 opacity-50" />
          </div>
          <div>
            <SkeletonOverline />
            <MaSkeleton height="h-4" width="w-36" className="mt-ma-2" />
            <MaSkeleton height="h-3" width="w-16" className="mt-ma-1 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
