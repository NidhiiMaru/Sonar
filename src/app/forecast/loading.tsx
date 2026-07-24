import { Skeleton } from "@/components/ui/Skeleton";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";

export default function ForecastLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      <Skeleton className="mt-6 h-11 w-72" />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <PanelHeader title="Risk band" />
          <PanelBody>
            <Skeleton className="h-[300px] w-full" />
          </PanelBody>
        </Panel>
        <Panel>
          <PanelHeader title="Drivers" />
          <PanelBody>
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </PanelBody>
        </Panel>
      </div>
      <Skeleton className="mt-4 h-56 w-full" />
    </div>
  );
}
