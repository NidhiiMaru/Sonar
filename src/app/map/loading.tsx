import { Skeleton } from "@/components/ui/Skeleton";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";

export default function MapLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-5 h-9 w-72" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-[60vh] min-h-[420px] w-full" />
        <Panel>
          <PanelHeader title="Incident register" />
          <PanelBody>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
