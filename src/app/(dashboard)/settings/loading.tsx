import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="space-y-4 rounded-xl border bg-card p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full md:col-span-2" />
          </div>
        ))}
      </div>
    </div>
  )
}
