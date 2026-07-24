import {
  CheckCircle2,
  Database,
  ExternalLink,
  TriangleAlert,
  Radar,
  Layers,
  ScanSearch,
  ListOrdered,
  Send,
} from "lucide-react";

import { DATA_SOURCES, SITE } from "@/lib/site";
import { pageMetadata } from "@/lib/metadata";
import { RANKING_FORMULA, RANKING_EXPLAINER, REVIEW_THRESHOLD } from "@/lib/ranking";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { ButtonLink } from "@/components/ui/Button";
import { ConfidenceChip } from "@/components/ui/ConfidenceChip";
import { GithubMark } from "@/components/ui/GithubMark";
import { RankingFormulaSandbox } from "@/components/about/RankingFormulaSandbox";

const PIPELINE = [
  { icon: Radar, title: "Sense", real: true, copy: "Five feeds pour in — AUV/ROV video, sonar, satellite, IoT buoys and citizen reports." },
  { icon: Layers, title: "Adapt", real: true, copy: "Typed zod adapters normalise each feed to the exact shape of the real open API it stands in for." },
  { icon: ScanSearch, title: "Detect", real: false, copy: "A simulated model emits a verdict: label, confidence (0.62–0.97, never 1.0), model version and source frame." },
  { icon: ListOrdered, title: "Rank", real: true, copy: "severity × confidence × ecological value orders every detection into one queue." },
  { icon: Send, title: "Triage", real: true, copy: "The ranked queue drives dispatch of the nearest vessel and an exportable evidence pack." },
];

export const metadata = pageMetadata({
  title: "Method & Data — DeepSea Guardian",
  description:
    "How DeepSea Guardian works, what is real, what is simulated, and the open ocean datasets behind it.",
  path: "/about",
});

/** Which already-built adapter matches each source's data shape. */
const ADAPTER_BY_SOURCE: Record<string, string> = {
  "Argo floats": "src/adapters — getBuoys()",
  GBIF: "src/adapters — getSpecies()",
  "Copernicus Marine": "src/adapters — getZones() / getForecasts()",
  "Global Fishing Watch": "src/adapters — getVessels()",
  "NOAA Ocean Exploration": "src/adapters — imagery + getIncidents() (synthetic)",
};

const REAL = [
  "The interface and interaction model — the ranked action queue, map, panels and console.",
  "The typed data model and the adapter boundary that every feed passes through.",
  "The ranking formula: severity × confidence × ecological value.",
  "The SEO surface (per-route metadata, OG, sitemap) and the accessibility work.",
];

const SIMULATED = [
  "The AI detection verdicts — not a trained model; they are generated from fixtures.",
  "The five sensor feeds (buoys, species, zones, vessels, imagery).",
  "The incident records and their timestamps, coordinates and confidence scores.",
];

const STATS = [
  {
    figure: "≈11 Mt",
    label: "plastic entering the ocean each year",
    cite: "Borrelle et al., Science (2020)",
  },
  {
    figure: "≈640,000 t",
    label: "fishing gear lost or abandoned each year",
    cite: "FAO / Global Ghost Gear Initiative",
  },
  {
    figure: "≈14%",
    label: "of the world's coral lost, 2009–2018",
    cite: "GCRMN, Status of Coral Reefs of the World (2020)",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <SectionHeading
        as="h1"
        eyebrow="Method & honesty"
        title="What's real, and what's simulated"
        lede="DeepSea Guardian is built to be trusted. This page is the honest ledger: the software contract is real and production-grade, the ocean data behind it is simulated, and here is exactly where the line falls."
      />

      {/* Real vs Simulated */}
      <section aria-labelledby="real-vs-sim" className="mt-14">
        <h2 id="real-vs-sim" className="sr-only">
          What is real versus what is simulated
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Panel className="border-bio/40">
            <PanelHeader
              title={
                <span className="flex items-center gap-2 text-bio">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  What is real
                </span>
              }
            />
            <PanelBody>
              <ul className="flex flex-col gap-3">
                {REAL.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-text-muted">
                    <CheckCircle2
                      size={16}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-bio"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </PanelBody>
          </Panel>

          <Panel className="border-warn/40">
            <PanelHeader
              title={
                <span className="flex items-center gap-2 text-warn">
                  <TriangleAlert size={18} aria-hidden="true" />
                  What is simulated
                </span>
              }
            />
            <PanelBody>
              <ul className="flex flex-col gap-3">
                {SIMULATED.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-text-muted">
                    <TriangleAlert
                      size={16}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-plum"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </PanelBody>
          </Panel>
        </div>
        <p className="mt-4 font-display text-lg font-semibold text-text">
          The data is simulated; the contract is real.
        </p>
      </section>

      {/* The AI pipeline */}
      <section aria-labelledby="pipeline" className="mt-16">
        <SectionHeading
          eyebrow="The pipeline"
          title="From five blind feeds to one ranked decision"
          lede="One accountable path from raw sensor noise to a dispatched vessel. Four of the five stages are real, production-grade software; only the detection verdict is simulated — and it says so."
        />
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PIPELINE.map((stage, i) => {
            const Icon = stage.icon;
            return (
              <li
                key={stage.title}
                className="flex flex-col gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line-bright bg-surface-2 text-glow">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span className="tabular text-xs font-semibold text-text-dim">0{i + 1}</span>
                </div>
                <h3 className="font-display text-h3 font-semibold text-text">{stage.title}</h3>
                <p className="text-xs text-text-muted">{stage.copy}</p>
                <span
                  className={
                    stage.real
                      ? "mt-auto inline-flex w-fit items-center gap-1 rounded-full border border-bio/40 bg-bio/10 px-2 py-0.5 text-[10px] font-medium text-bio"
                      : "mt-auto inline-flex w-fit items-center gap-1 rounded-full border border-plum/40 bg-plum/10 px-2 py-0.5 text-[10px] font-medium text-plum"
                  }
                >
                  {stage.real ? "Real" : "Simulated"}
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Provenance / trust thesis */}
      <section aria-labelledby="provenance" className="mt-16">
        <SectionHeading
          eyebrow="Provenance"
          title="Why you can trust a number that admits doubt"
          lede="A model that is always sure is a lying model. Every verdict here carries its confidence, its model version and the frame it was inferred from — and anything the model is unsure about is handed back to a human."
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Panel>
            <PanelBody className="flex flex-col gap-4">
              <p className="text-sm text-text-muted">{RANKING_EXPLAINER}</p>
              <div className="rounded-[var(--radius-sm)] border border-plum/30 bg-plum/5 px-3 py-2 text-center">
                <span className="font-display text-sm font-semibold text-plum">
                  rank = {RANKING_FORMULA}
                </span>
              </div>
              <p className="text-sm text-text-muted">
                Confidence is never <span className="tabular">1.0</span>. Any detection below{" "}
                <span className="tabular font-medium text-warn">
                  {Math.round(REVIEW_THRESHOLD * 100)}%
                </span>{" "}
                is surfaced as <em>needs human review</em> rather than actioned automatically —
                the operator stays in the loop exactly where the machine is weakest.
              </p>
            </PanelBody>
          </Panel>
          <Panel>
            <PanelHeader title="What a verdict looks like" />
            <PanelBody className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-text-muted">High confidence</span>
                <ConfidenceChip value={0.91} modelVersion="dsg-detect-v2.1" evidenceFrame="SONAR frame 4821" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-text-muted">Needs review</span>
                <ConfidenceChip value={0.64} modelVersion="dsg-detect-v2.1" evidenceFrame="AUV frame 1130" />
              </div>
              <p className="text-xs text-text-dim">
                Hover either chip: the tooltip carries the model version and the source frame.
                The same chip appears on every incident across the console.
              </p>
            </PanelBody>
          </Panel>
        </div>
        
        <div className="mt-6">
          <RankingFormulaSandbox />
        </div>
      </section>

      {/* Data sources table */}
      <section aria-labelledby="data-sources" className="mt-16">
        <SectionHeading
          eyebrow="Open ocean data"
          title="Data sources & the adapters that already match them"
          lede="Every feed is designed against a real public dataset. Swapping fixtures for live data means implementing the adapter body below — the shape and the callers do not change."
        />
        <Panel className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <caption className="px-4 py-3 text-left text-xs text-text-dim">
              Public datasets DeepSea Guardian is modelled on, and the typed
              adapter each one already maps to.
            </caption>
            <thead>
              <tr className="border-y border-line text-text-dim">
                <th scope="col" className="px-4 py-3 font-semibold">
                  Source
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  What we would pull
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  Adapter that already matches its shape
                </th>
              </tr>
            </thead>
            <tbody>
              {DATA_SOURCES.map((source) => (
                <tr
                  key={source.name}
                  className="border-b border-line last:border-b-0 align-top"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 font-medium text-text"
                  >
                    <a
                      href={source.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] text-glow underline decoration-glow/40 underline-offset-4 hover:decoration-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    >
                      {source.name}
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  </th>
                  <td className="px-4 py-3 text-text-muted">{source.use}</td>
                  <td className="px-4 py-3 text-text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Database
                        size={14}
                        aria-hidden="true"
                        className="shrink-0 text-text-dim"
                      />
                      <code className="font-mono text-xs text-text">
                        {ADAPTER_BY_SOURCE[source.name] ?? "—"}
                      </code>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      {/* Statistics + citations */}
      <section aria-labelledby="statistics" className="mt-16">
        <SectionHeading
          eyebrow="Why it matters"
          title="The three numbers, with their sources"
          lede="The headline statistics are drawn from peer-reviewed and intergovernmental estimates, cited in full so you can check them."
        />
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <Panel key={stat.label} className="p-5">
              <p className="font-display text-kpi font-bold text-glow tabular">
                {stat.figure}
              </p>
              <p className="mt-2 text-sm text-text-muted">{stat.label}</p>
              <p className="mt-3 text-xs text-text-dim">{stat.cite}</p>
            </Panel>
          ))}
        </div>
      </section>

      {/* Disclosures */}
      <section aria-labelledby="disclosures" className="mt-16">
        <SectionHeading
          eyebrow="Full disclosure"
          title="How the demo behaves, and how it was built"
        />
        <div className="mt-6 flex flex-col gap-4">
          <Panel>
            <PanelHeader title="Client-only state" />
            <PanelBody>
              <p className="max-w-[65ch] text-sm text-text-muted">
                Dispatching, assigning and resolving an incident updates state in
                your browser only. There is no backend and nothing is persisted —
                reload the page and the queue resets to its starting fixtures. It
                is an honest fake: the actions demonstrate the workflow without
                pretending to command a real fleet.
              </p>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="Built with AI assistance" />
            <PanelBody>
              <p className="max-w-[65ch] text-sm text-text-muted">
                DeepSea Guardian was built with AI assistance: Claude Code for
                implementation, and Claude for planning, copy and the
                design-system specification. All code was written and committed
                during the official Round 2 window. The architecture and every
                decision were directed and reviewed by the team.
              </p>
            </PanelBody>
          </Panel>

          <Panel>
            <PanelHeader title="Image credits" />
            <PanelBody>
              <p className="max-w-[65ch] text-sm text-text-muted">
                Imagery is from NOAA Ocean Exploration (public domain) and
                Pexels / Coverr (free licence). The coral-bleaching indicator
                uses a CC0 image — <em>Porites lobata</em> by Francois Seneca.
                None of these credits are required by their licences; we give
                them as a matter of good practice.
              </p>
            </PanelBody>
          </Panel>
        </div>
      </section>

      {/* Team + links */}
      <section aria-labelledby="team" className="mt-16">
        <Panel className="p-6">
          <h2 id="team" className="font-display text-h3 font-bold text-text">
            Team Sonar
          </h2>
          <p className="mt-2 max-w-[65ch] text-sm text-text-muted">
            Built for HackOcean 2026. The source is open — read it, run it, and
            check the contract for yourself.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-line-bright bg-surface-2 px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <GithubMark size={16} />
              View the repository
            </a>
            <ButtonLink href="/dashboard" variant="primary">
              Back to console
            </ButtonLink>
          </div>
        </Panel>
      </section>
    </div>
  );
}
