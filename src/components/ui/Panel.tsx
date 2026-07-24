import { createElement } from "react";
import { cn } from "@/lib/utils";

/** The one card/panel surface. surface bg, hairline border, md radius.
 *  Uses createElement for the polymorphic tag so R3F's global JSX augmentation
 *  can't collapse the children type to `never`. */
export function Panel({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) {
  return createElement(
    Tag,
    { className: cn("rounded-[var(--radius-md)] border border-line bg-surface", className) },
    children,
  );
}

export function PanelHeader({
  title,
  action,
  className,
  id,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-line px-4 py-3",
        className,
      )}
    >
      <h2 id={id} className="text-sm font-semibold text-text">
        {title}
      </h2>
      {action}
    </div>
  );
}

export function PanelBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
