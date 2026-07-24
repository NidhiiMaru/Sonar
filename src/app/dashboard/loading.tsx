import { Skeleton } from "@/components/ui/Skeleton";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-9 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-3">
          <PanelHeader title="Live threat map" />
          <PanelBody>
            <Skeleton className="h-[340px] w-full" />
          </PanelBody>
        </Panel>
        <Panel className="lg:col-span-2">
          <PanelHeader title="AI triage queue" />
          <PanelBody>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          </PanelBody>
        </Panel>
      </div>
    </div>
  );
}
