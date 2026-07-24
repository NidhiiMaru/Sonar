import { Skeleton } from "@/components/ui/Skeleton";

/** Box-reserving skeleton for dynamically-loaded charts (protects CLS). */
export function ChartSkeleton({ height = 260 }: { height?: number }) {
  return (
    <div className="flex flex-col justify-end gap-2" style={{ height }} aria-hidden="true">
      <div className="flex flex-1 items-end gap-2 px-2">
        {[40, 65, 50, 80, 55, 70, 45, 60, 75, 50, 68, 58].map((h, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}
