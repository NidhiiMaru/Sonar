"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { sonarAudio } from "@/lib/sonar-audio";

interface Props {
  index: number;
  name: string;
  copy: string;
  icon: ReactNode;
}

export function InteractiveStepCard({ index, name, copy, icon }: Props) {
  return (
    <motion.li
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={() => sonarAudio.playClickBlip()}
      className="group relative flex flex-col gap-4 rounded-[var(--radius-md)] border border-line bg-surface p-6 transition-colors hover:border-glow/40 hover:bg-surface-2 shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line-bright bg-surface-2 text-glow transition-all group-hover:border-glow group-hover:bg-glow/10 group-hover:shadow-[0_0_12px_rgba(34,211,238,0.3)]">
            {icon}
          </span>
          <span className="tabular font-mono text-xs font-semibold text-text-dim">
            0{index + 1}
          </span>
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-line group-hover:bg-glow group-hover:shadow-[0_0_6px_var(--color-glow)] transition-all" />
      </div>

      <h3 className="font-display text-h3 font-semibold text-text group-hover:text-glow transition-colors">
        {name}
      </h3>
      <p className="text-sm text-text-muted leading-relaxed">{copy}</p>

      {/* Subtle bottom glow accent line */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-[var(--radius-md)] bg-gradient-to-r from-transparent via-glow/0 to-transparent group-hover:via-glow transition-all duration-300" />
    </motion.li>
  );
}
