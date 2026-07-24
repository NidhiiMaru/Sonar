"use client";

import { useState } from "react";
import { Sliders, Calculator, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Panel, PanelHeader, PanelBody } from "@/components/ui/Panel";
import { sonarAudio } from "@/lib/sonar-audio";

export function RankingFormulaSandbox() {
  const [severity, setSeverity] = useState(85); // 0 -> 100
  const [confidence, setConfidence] = useState(0.88); // 0.60 -> 0.99
  const [ecologicalValue, setEcologicalValue] = useState(90); // 0 -> 100

  // rank = severity * confidence * (1 + ecologicalValue / 100)
  const calculatedRank = Math.round(severity * confidence * (1 + ecologicalValue / 100));

  const isReviewNeeded = confidence < 0.75;

  return (
    <Panel className="border-glow/30 shadow-xl">
      <PanelHeader
        title={
          <span className="flex items-center gap-2 text-glow font-mono text-sm uppercase">
            <Calculator size={16} />
            Interactive Ranking Formula Sandbox
          </span>
        }
      />
      <PanelBody className="flex flex-col gap-6">
        <p className="text-xs text-text-muted">
          Adjust the baseline telemetry inputs below to test how Sonar calculates incident urgency in real time.
        </p>

        {/* Sliders */}
        <div className="flex flex-col gap-4 font-mono text-xs">
          {/* Severity Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-text-muted">Severity Weight:</span>
              <span className="font-bold text-text">{severity} / 100</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={severity}
              onChange={(e) => {
                setSeverity(Number(e.target.value));
                sonarAudio.playClickBlip();
              }}
              className="h-1.5 w-full cursor-pointer accent-glow bg-surface-3 rounded-lg"
            />
          </div>

          {/* Confidence Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-text-muted">AI Model Confidence:</span>
              <span className={`font-bold ${isReviewNeeded ? "text-warn" : "text-bio"}`}>
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
            <input
              type="range"
              min="0.60"
              max="0.99"
              step="0.01"
              value={confidence}
              onChange={(e) => {
                setConfidence(Number(e.target.value));
                sonarAudio.playClickBlip();
              }}
              className="h-1.5 w-full cursor-pointer accent-bio bg-surface-3 rounded-lg"
            />
          </div>

          {/* Ecological Value Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between">
              <span className="text-text-muted">Ecological Zone Multiplier:</span>
              <span className="font-bold text-plum">{ecologicalValue} / 100</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={ecologicalValue}
              onChange={(e) => {
                setEcologicalValue(Number(e.target.value));
                sonarAudio.playClickBlip();
              }}
              className="h-1.5 w-full cursor-pointer accent-plum bg-surface-3 rounded-lg"
            />
          </div>
        </div>

        {/* Calculated Result Box */}
        <div className="flex items-center justify-between rounded-md border border-line-bright bg-surface-2 p-4">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase text-text-dim">Computed Queue Score</span>
            <span className="font-display text-kpi font-bold text-glow tabular">
              {calculatedRank}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1">
            {isReviewNeeded ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-warn/40 bg-warn/10 px-2.5 py-1 text-xs font-semibold text-warn">
                <ShieldAlert size={13} />
                Requires Human Operator Review
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-bio/40 bg-bio/10 px-2.5 py-1 text-xs font-semibold text-bio">
                <CheckCircle2 size={13} />
                Auto-Triage Ready
              </span>
            )}
            <span className="font-mono text-[10px] text-text-dim">
              Formula: {severity} × {confidence.toFixed(2)} × (1 + {(ecologicalValue/100).toFixed(2)})
            </span>
          </div>
        </div>
      </PanelBody>
    </Panel>
  );
}
