import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-4">
            <Skeleton className="h-4 w-24" />
            <div className="mt-4 space-y-2">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-4 h-56 w-full" />
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-4">
            <Skeleton className="h-5 w-40" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-4 h-24 w-full" />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}
