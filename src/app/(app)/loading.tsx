import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header skeleton */}
      <div className="flex items-center gap-4 px-4 py-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Content skeleton */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-48 w-48 rounded-full" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-3/4 rounded-xl" />
        <Skeleton className="h-12 w-1/2 rounded-xl" />
      </div>

      {/* Bottom nav skeleton */}
      <div className="flex items-center justify-around border-t border-border/50 px-4 py-3">
        <Skeleton className="h-10 w-16 rounded-lg" />
        <Skeleton className="h-10 w-16 rounded-lg" />
      </div>
    </div>
  );
}
