"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sonarAudio } from "@/lib/sonar-audio";

/**
 * Enables/disables the Web-Audio sonar layer (ping on globe/step hover).
 * Audio is OFF by default — browsers block sound until a user gesture, and the
 * toggle IS that gesture. Enabling plays a confirmation ping.
 */
export function SoundToggle() {
  const [on, setOn] = useState(false);

  function toggle() {
    const next = !on;
    setOn(next);
    sonarAudio.setEnabled(next);
    if (next) sonarAudio.playSonarPing(660, 0.9);
  }

  return (
    <button
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? "Mute sonar audio" : "Enable sonar audio"}
      title={on ? "Sonar audio on" : "Sonar audio off"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-line text-text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
    >
      {on ? (
        <Volume2 size={16} className="text-glow" />
      ) : (
        <VolumeX size={16} />
      )}
    </button>
  );
}
