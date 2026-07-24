"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Maximize2, Minimize2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineWorkspacePanelProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  idBadge?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number) => void;
}

export function InlineWorkspacePanel({
  open,
  onClose,
  title,
  idBadge,
  headerActions,
  children,
  defaultWidth = 480,
  minWidth = 360,
  maxWidth = 850,
  onWidthChange,
}: InlineWorkspacePanelProps) {
  const [panelWidth, setPanelWidth] = useState(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const startResizing = useCallback(
    (mouseDownEvent: React.MouseEvent) => {
      mouseDownEvent.preventDefault();
      setIsDragging(true);

      const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
        const newWidth = window.innerWidth - mouseMoveEvent.clientX;
        const clampedMax = Math.min(maxWidth, window.innerWidth - 300);
        const clamped = Math.min(Math.max(newWidth, minWidth), clampedMax);
        setPanelWidth(clamped);
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [minWidth, maxWidth],
  );

  const currentWidth = isMaximized ? Math.min(750, window.innerWidth - 320) : panelWidth;

  // Notify parent of width changes so main content can adjust dynamically
  useEffect(() => {
    if (open) {
      onWidthChange?.(currentWidth);
    } else {
      onWidthChange?.(0);
    }
  }, [open, currentWidth, onWidthChange]);

  // Close panel on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <aside
      aria-label="Workspace detail panel"
      style={{ width: `${currentWidth}px` }}
      className={cn(
        "fixed top-0 right-0 bottom-0 z-50 flex flex-col border-l border-line-bright bg-surface shadow-[-20px_0_40px_rgba(0,0,0,0.6)]",
        isDragging ? "select-none transition-none" : "transition-[width] duration-150 ease-out",
      )}
    >
      {/* Left Edge ClickUp Drag Resizer Handle */}
      <div
        onMouseDown={startResizing}
        className={cn(
          "absolute -left-2 top-0 bottom-0 z-30 hidden sm:flex w-4 cursor-col-resize items-center justify-center transition-colors group",
          isDragging ? "bg-glow/20" : "hover:bg-glow/10",
        )}
        title="Click & Drag to resize workspace panel (ClickUp style)"
      >
        <div
          className={cn(
            "flex h-14 w-2 items-center justify-center rounded-full border bg-surface-2 transition-all shadow-md",
            isDragging
              ? "border-glow bg-glow/30 text-glow shadow-[0_0_10px_var(--color-glow)]"
              : "border-line-bright text-text-dim group-hover:border-glow group-hover:text-glow",
          )}
        >
          <GripVertical size={12} />
        </div>
      </div>

      {/* Top Header Toolbar */}
      <div className="flex items-center justify-between border-b border-line bg-surface-2/80 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-hidden">
          {idBadge}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {headerActions}

          <button
            type="button"
            onClick={() => setIsMaximized(!isMaximized)}
            className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-line bg-surface text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
            title={isMaximized ? "Restore width" : "Maximize width"}
          >
            {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close side workspace"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-line bg-surface text-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Title Bar */}
      <div className="border-b border-line px-5 py-3.5">
        <div className="font-display text-lg font-bold text-text truncate">
          {title}
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}
