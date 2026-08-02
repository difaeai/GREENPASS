import { Skeleton } from "@/components/ui/primitives";

/** Skeleton shown while a public route's server data resolves. */
export default function PublicLoading() {
  return (
    <div aria-busy="true" aria-label="Loading page content">
      <div className="wash-blue relative border-b border-brand-100/70 pt-14 pb-16 sm:pt-20 sm:pb-24 dark:border-navy-800">
        <div className="container-page">
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="mt-7 h-11 w-full max-w-2xl" />
          <Skeleton className="mt-3 h-11 w-2/3 max-w-lg" />
          <Skeleton className="mt-6 h-4 w-full max-w-xl" />
          <Skeleton className="mt-2 h-4 w-4/5 max-w-md" />
        </div>
      </div>

      <div className="container-page py-18 sm:py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="surface-card overflow-hidden p-0">
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="space-y-3 p-6">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-5/6" />
                <Skeleton className="h-3.5 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
