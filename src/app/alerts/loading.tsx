import { Skeleton } from "@/components/ui/Skeleton";
import { Panel, PanelBody } from "@/components/ui/Panel";

export default function AlertsLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Skeleton className="h-9 w-52" />
      <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
      <Panel className="mt-6">
        <PanelBody>
          <Skeleton className="h-9 w-72" />
          <div className="mt-4 flex flex-col gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}
