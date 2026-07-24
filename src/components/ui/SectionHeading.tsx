import { cn } from "@/lib/utils";

/** eyebrow (glow, uppercase) + h2 + optional lede. Used to open every section. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  as: Heading = "h2",
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  as?: "h1" | "h2";
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-glow">
          {eyebrow}
        </span>
      )}
      <Heading
        className={cn(
          "font-display font-bold text-text",
          Heading === "h1" ? "text-h1" : "text-h2",
        )}
      >
        {title}
      </Heading>
      {lede && (
        <p
          className={cn(
            "max-w-[65ch] text-balance text-text-muted",
            align === "center" && "mx-auto",
          )}
        >
          {lede}
        </p>
      )}
    </div>
  );
}
