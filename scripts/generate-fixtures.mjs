/**
 * Deterministic fixture generator.
 *
 * Fake data, real shapes — obeys the realism rules on purpose:
 *  - confidence 0.62–0.97, clustered ~0.85, with ≥3 below 0.70 ("needs review")
 *  - ranking = severityWeight × confidence × zoneBiodiversityIndex/100 (computed)
 *  - zone risk is a function of its drivers (so they can never disagree)
 *  - forecast CI widens with horizon; timestamps cluster around "storm events"
 *  - not everything is on fire: 2 healthy zones, degraded/offline buoys
 *
 * Run: `node scripts/generate-fixtures.mjs` → src/fixtures/*.json
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "src", "fixtures");

// ---- seeded PRNG (mulberry32) so output is stable & regenerable ----
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260724);
const rand = (lo, hi) => lo + rnd() * (hi - lo);
const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const round1 = (v) => Math.round(v * 10) / 10;
const round2 = (v) => Math.round(v * 100) / 100;
function gauss(mean, sd) {
  const u = 1 - rnd();
  const v = rnd();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const NOW = Date.now();
const HOUR = 3600_000;
const DAY = 24 * HOUR;

// ---------------------------------------------------------------------------
// ZONES — hand-authored so risk is a real function of drivers, and the
// health mix is deliberate (2 healthy, ~4 medium, 2 high).
// ---------------------------------------------------------------------------
const ZONE_DEFS = [
  { id: "Z-01", name: "Mariana Rim", c: [15.5, 147.5], bio: 88, d: { sst: 1.1, drift: 44, traffic: 38, history: 52 } },
  { id: "Z-02", name: "Coral Triangle N", c: [4.0, 123.0], bio: 95, d: { sst: 2.3, drift: 66, traffic: 88, history: 79 } },
  { id: "Z-03", name: "Sulu Shelf", c: [7.5, 120.5], bio: 72, d: { sst: 1.6, drift: 58, traffic: 71, history: 63 } },
  { id: "Z-04", name: "Banda Deep", c: [-5.5, 128.5], bio: 80, d: { sst: 0.9, drift: 40, traffic: 34, history: 45 } },
  { id: "Z-05", name: "Andaman Ridge", c: [10.0, 94.0], bio: 68, d: { sst: 0.4, drift: 22, traffic: 18, history: 20 } },
  { id: "Z-06", name: "Sunda Trench", c: [-9.5, 104.0], bio: 61, d: { sst: 1.8, drift: 61, traffic: 84, history: 70 } },
  { id: "Z-07", name: "Bismarck Sea", c: [-3.5, 150.0], bio: 84, d: { sst: 1.0, drift: 47, traffic: 41, history: 33 } },
  { id: "Z-08", name: "Palawan Trough", c: [10.5, 118.0], bio: 57, d: { sst: 0.3, drift: 19, traffic: 15, history: 16 } },
];

function riskFromDrivers(d) {
  const sstNorm = clamp((d.sst / 3) * 100, 0, 100);
  return Math.round(0.3 * sstNorm + 0.2 * d.drift + 0.25 * d.traffic + 0.25 * d.history);
}

function makePolygon(c) {
  const [lat, lng] = c;
  const n = randInt(5, 7);
  const rLat = rand(0.9, 1.5);
  const rLng = rand(1.0, 1.7);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + rand(-0.15, 0.15);
    const jitter = rand(0.75, 1.15);
    pts.push([
      round2(lat + Math.sin(ang) * rLat * jitter),
      round2(lng + Math.cos(ang) * rLng * jitter),
    ]);
  }
  return pts;
}

const zones = ZONE_DEFS.map((z) => {
  const riskScore = riskFromDrivers(z.d);
  return {
    id: z.id,
    name: z.name,
    polygon: makePolygon(z.c),
    centroid: [round2(z.c[0]), round2(z.c[1])],
    riskScore,
    riskDelta: Math.round(gauss(riskScore > 60 ? 4 : -1, 5)),
    biodiversityIndex: z.bio,
    drivers: { sstAnomaly: round1(z.d.sst), drift: z.d.drift, vesselTraffic: z.d.traffic, history: z.d.history },
  };
});
const zoneById = Object.fromEntries(zones.map((z) => [z.id, z]));

// ---------------------------------------------------------------------------
// INCIDENTS — 42, distributed by zone risk, realistic severity/confidence mix
// ---------------------------------------------------------------------------
const TYPES = ["plastic", "ghost_net", "bleaching", "dumping", "species_alert"];
const TYPE_LABEL = {
  plastic: "Plastic debris cluster",
  ghost_net: "Ghost net",
  bleaching: "Coral bleaching event",
  dumping: "Illegal dumping",
  species_alert: "Protected species at risk",
};
const TYPE_SOURCES = {
  plastic: ["satellite", "citizen", "auv"],
  ghost_net: ["sonar", "auv"],
  bleaching: ["satellite", "auv"],
  dumping: ["sonar", "citizen", "satellite"],
  species_alert: ["auv", "citizen"],
};
const TYPE_MODEL = {
  plastic: "dsg-detect-v2.1",
  ghost_net: "dsg-detect-v2.1",
  bleaching: "dsg-thermal-v1.4",
  dumping: "dsg-detect-v2.1",
  species_alert: "dsg-biotrack-v1.2",
};
const TYPE_IMAGES = {
  plastic: ["ev-plastic-bottle", "ev-plastic-dark", "ev-plastic-shore"],
  ghost_net: ["ev-ghostnet-turtle", "ev-ghostnet"],
  bleaching: ["ev-bleached"],
  dumping: ["ev-plastic-dark", "ev-plastic-shore"],
  species_alert: ["sp-sea-turtle", "sp-humpback", "sp-sixgill-shark", "sp-rockfish", "sp-red-crab"],
};
const RATIONALES = {
  ghost_net: [
    "Linear sonar returns at 18 m depth inconsistent with reef structure; pattern matches monofilament netting.",
    "Repeating lattice signature on side-scan, drifting with the current — consistent with an abandoned gillnet.",
    "High-density tangle detected below the thermocline; acoustic shadowing typical of derelict netting.",
  ],
  plastic: [
    "Surface reflectance cluster with polymer-consistent spectral signature; 40+ discrete fragments in frame.",
    "Buoyant debris field tracked across two satellite passes; drift vector matches modelled gyre transport.",
    "Sub-surface particulate density three standard deviations above the zone baseline.",
  ],
  bleaching: [
    "Sea-surface temperature 2.1 °C above the seasonal mean for nine consecutive days; reflectance whitening observed.",
    "Thermal-stress accumulation exceeding 4 degree-heating-weeks; colony pallor confirmed on ROV pass.",
    "Rapid rise in reef albedo consistent with zooxanthellae expulsion under heat stress.",
  ],
  dumping: [
    "Dense angular seafloor returns off a charted shipping lane; no permitted disposal site on record.",
    "Turbidity plume originating from a stationary vessel track logged overnight; sediment load anomalous.",
    "Fresh spoil mound geometry inconsistent with natural deposition; edges sharp on repeat survey.",
  ],
  species_alert: [
    "Individual tracked within 200 m of an active ghost-net detection; behaviour suggests entanglement risk.",
    "Protected megafauna logged inside a high-traffic corridor during a documented dumping window.",
    "Repeat sighting of a threatened species in a zone with a rising thermal-stress index.",
  ],
};
const ACTIONS = {
  ghost_net: "Dispatch nearest recovery vessel; net removal within 48 h to prevent further bycatch.",
  plastic: "Task a skimmer sweep on the drift path; notify the coastal cleanup partner.",
  bleaching: "Deploy an ROV transect to ground-truth extent; flag zone for thermal watch.",
  dumping: "Preserve evidence pack for enforcement; request vessel-traffic cross-reference.",
  species_alert: "Establish a temporary exclusion radius; alert the marine-mammal response team.",
};

// storm-event timestamp clusters (days-ago centres), plus quiet gaps
const STORM_CENTRES = [0.4, 1.2, 3.1, 5.8, 9.5, 13.2];
function stormTimestamp() {
  const centre = pick(STORM_CENTRES);
  const daysAgo = clamp(centre + gauss(0, 0.5), 0.05, 14);
  return new Date(NOW - daysAgo * DAY).toISOString();
}

// severity budget: 6 high, 14 medium, 22 low
const SEV_BUDGET = [
  ...Array(6).fill("high"),
  ...Array(14).fill("medium"),
  ...Array(22).fill("low"),
];
// shuffle severities deterministically
for (let i = SEV_BUDGET.length - 1; i > 0; i--) {
  const j = Math.floor(rnd() * (i + 1));
  [SEV_BUDGET[i], SEV_BUDGET[j]] = [SEV_BUDGET[j], SEV_BUDGET[i]];
}

// zone weighting: higher-risk zones host more incidents
const zoneWeights = zones.map((z) => ({ id: z.id, w: z.riskScore + 10 }));
const totalW = zoneWeights.reduce((s, z) => s + z.w, 0);
function weightedZone() {
  let r = rnd() * totalW;
  for (const z of zoneWeights) {
    if ((r -= z.w) <= 0) return z.id;
  }
  return zoneWeights[0].id;
}

const SEVERITY_WEIGHT = { high: 3, medium: 2, low: 1 };
const usedGhostTurtle = { done: false };

const incidents = [];
for (let i = 0; i < 42; i++) {
  const severity = SEV_BUDGET[i];
  const zoneId = weightedZone();
  const zone = zoneById[zoneId];
  // type: bias by severity (high skews to ghost_net/dumping/bleaching)
  let type;
  if (severity === "high") type = pick(["ghost_net", "dumping", "bleaching", "ghost_net"]);
  else if (severity === "medium") type = pick(["plastic", "bleaching", "ghost_net", "species_alert"]);
  else type = pick(["plastic", "species_alert", "plastic", "bleaching"]);

  const source = pick(TYPE_SOURCES[type]);
  // confidence clustered ~0.85
  let confidence = clamp(round2(gauss(0.85, 0.07)), 0.62, 0.97);

  // coords: jitter around zone centroid
  const coords = [
    round2(zone.centroid[0] + gauss(0, 0.6)),
    round2(zone.centroid[1] + gauss(0, 0.7)),
  ];

  // flagship ghost-net-turtle image on the first high-severity ghost_net
  let imageKey;
  if (type === "ghost_net" && severity === "high" && !usedGhostTurtle.done) {
    imageKey = "ev-ghostnet-turtle";
    usedGhostTurtle.done = true;
  } else {
    imageKey = pick(TYPE_IMAGES[type]);
  }

  const detectedAt = stormTimestamp();
  const inferredAt = new Date(new Date(detectedAt).getTime() + randInt(2, 40) * 60_000).toISOString();
  const id = `INC-2026-${String(400 + i).padStart(4, "0")}`;

  incidents.push({
    id,
    type,
    severity,
    status: "new", // set below
    zoneId,
    coords,
    detectedAt,
    source,
    imageKey,
    ai: {
      label: TYPE_LABEL[type],
      confidence,
      modelVersion: TYPE_MODEL[type],
      inferredAt,
      evidenceFrame: `${source.toUpperCase()} frame ${randInt(1000, 9999)} · ${id}`,
      rationale: pick(RATIONALES[type]),
    },
    rank: 0, // computed below
    recommendedAction: ACTIONS[type],
  });
}

// guarantee ≥3 incidents below 0.70 (needs human review) — set the 4 lowest
incidents.sort((a, b) => a.ai.confidence - b.ai.confidence);
for (let i = 0; i < 4; i++) incidents[i].ai.confidence = round2(rand(0.62, 0.69));

// status mix: newest = new; older ones assigned/resolved
incidents.sort((a, b) => new Date(b.detectedAt) - new Date(a.detectedAt));
incidents.forEach((inc, i) => {
  if (i < 26) inc.status = "new";
  else if (i < 36) inc.status = "assigned";
  else inc.status = "resolved";
});

// compute rank (same formula the app sorts by)
for (const inc of incidents) {
  const zone = zoneById[inc.zoneId];
  inc.rank = round2(SEVERITY_WEIGHT[inc.severity] * inc.ai.confidence * (zone.biodiversityIndex / 100));
}
// stable id order in the file (app re-sorts by rank at load)
incidents.sort((a, b) => a.id.localeCompare(b.id));

// assign vessels to "assigned" incidents (set after vessels defined below)

// ---------------------------------------------------------------------------
// SPECIES — 12, real biology, matched 1:1 to optimised images
// ---------------------------------------------------------------------------
const SPECIES_DEFS = [
  { slug: "dumbo-octopus", commonName: "Dumbo octopus", scientificName: "Grimpoteuthis sp.", iucn: "DD", trend: "stable", depth: [3000, 4800], img: "sp-dumbo-octopus", zones: ["Z-01", "Z-04"], blurb: "The deepest-living of all known octopuses, named for the ear-like fins it flaps to hover above the abyssal seabed." },
  { slug: "deep-sea-anglerfish", commonName: "Deep-sea anglerfish", scientificName: "Chaunacops coloratus", iucn: "LC", trend: "stable", depth: [1800, 3300], img: "sp-anglerfish", zones: ["Z-01", "Z-06"], blurb: "A sit-and-wait ambush predator of the bathyal zone that walks the seafloor on modified, limb-like fins." },
  { slug: "giant-tubeworm", commonName: "Giant tubeworm", scientificName: "Riftia pachyptila", iucn: "LC", trend: "stable", depth: [1500, 2600], img: "sp-tubeworms", zones: ["Z-06", "Z-01"], blurb: "A hydrothermal-vent worm with no gut, living entirely on chemosynthetic bacteria housed in its tissues." },
  { slug: "green-sea-turtle", commonName: "Green sea turtle", scientificName: "Chelonia mydas", iucn: "EN", trend: "decreasing", depth: [0, 40], img: "sp-sea-turtle", zones: ["Z-02", "Z-03", "Z-08"], blurb: "A long-lived marine reptile and important seagrass grazer; globally endangered, with entanglement a leading threat." },
  { slug: "humpback-whale", commonName: "Humpback whale", scientificName: "Megaptera novaeangliae", iucn: "LC", trend: "increasing", depth: [0, 200], img: "sp-humpback", zones: ["Z-07", "Z-04"], blurb: "A migratory baleen whale whose global numbers have recovered strongly since the end of commercial whaling." },
  { slug: "bluntnose-sixgill-shark", commonName: "Bluntnose sixgill shark", scientificName: "Hexanchus griseus", iucn: "NT", trend: "decreasing", depth: [0, 2500], img: "sp-sixgill-shark", zones: ["Z-01", "Z-06"], blurb: "A large, slow-growing deep-water shark that rises toward the surface at night; near threatened and sensitive to fishing pressure." },
  { slug: "crown-of-thorns-starfish", commonName: "Crown-of-thorns starfish", scientificName: "Acanthaster planci", iucn: "LC", trend: "increasing", depth: [0, 30], img: "sp-crown-of-thorns", zones: ["Z-02", "Z-03"], blurb: "A coral-eating sea star whose population outbreaks can strip reefs; monitored as a driver of coral decline." },
  { slug: "pink-helmet-jellyfish", commonName: "Pink helmet jellyfish", scientificName: "Poralia rufescens", iucn: "DD", trend: "stable", depth: [1000, 3000], img: "sp-pink-jelly", zones: ["Z-04", "Z-07"], blurb: "A fragile, deep-water scyphozoan tinted red — a colour that is effectively invisible in the lightless deep." },
  { slug: "bamboo-coral", commonName: "Bamboo coral", scientificName: "Isidella sp.", iucn: "VU", trend: "decreasing", depth: [500, 2000], img: "sp-bamboo-coral", zones: ["Z-01", "Z-07"], blurb: "A slow-growing deep-sea coral that builds centuries-old habitat; vulnerable to bottom trawling and warming." },
  { slug: "rougheye-rockfish", commonName: "Rougheye rockfish", scientificName: "Sebastes aleutianus", iucn: "LC", trend: "stable", depth: [150, 900], img: "sp-rockfish", zones: ["Z-01", "Z-04"], blurb: "One of the longest-lived fishes known, with individuals verified beyond 200 years; shelters in deep coral." },
  { slug: "red-deep-sea-crab", commonName: "Red deep-sea crab", scientificName: "Chaceon quinquedens", iucn: "DD", trend: "stable", depth: [200, 1800], img: "sp-red-crab", zones: ["Z-03", "Z-08"], blurb: "A deep-slope crab that scavenges the continental margin; the target of a small, tightly managed fishery." },
  { slug: "lobe-coral", commonName: "Lobe coral", scientificName: "Porites lobata", iucn: "NT", trend: "decreasing", depth: [0, 30], img: "sp-lobe-coral", zones: ["Z-02", "Z-03"], blurb: "A massive reef-building coral and a key bleaching indicator; whitens rapidly under sustained heat stress." },
];

function trendSeries(trend) {
  const start = randInt(45, 75);
  const step = trend === "increasing" ? rand(0.5, 2.2) : trend === "decreasing" ? -rand(0.5, 2.2) : 0;
  const out = [];
  let v = start;
  for (let i = 0; i < 12; i++) {
    v = clamp(v + step + gauss(0, 1.4), 5, 100);
    out.push(Math.round(v));
  }
  return out;
}
const species = SPECIES_DEFS.map((s, i) => ({
  id: `SP-${String(i + 1).padStart(2, "0")}`,
  slug: s.slug,
  commonName: s.commonName,
  scientificName: s.scientificName,
  iucn: s.iucn,
  populationTrend: s.trend,
  trendSeries: trendSeries(s.trend),
  zoneIds: s.zones,
  imageKey: s.img,
  depthRange: s.depth,
  blurb: s.blurb,
}));

// ---------------------------------------------------------------------------
// BUOYS — 18, 30 hourly readings; 2 degraded, 1 offline
// ---------------------------------------------------------------------------
const buoys = [];
for (let i = 0; i < 18; i++) {
  const zone = zones[i % zones.length];
  const id = `BUOY-${String(i + 1).padStart(2, "0")}`;
  const status = i === 5 ? "offline" : i === 9 || i === 14 ? "degraded" : "online";
  const baseSst = 26 + zone.drivers.sstAnomaly + gauss(0, 0.6);
  const readings = [];
  const count = status === "offline" ? 6 : 30; // offline stopped reporting
  for (let h = count - 1; h >= 0; h--) {
    const t = new Date(NOW - h * HOUR).toISOString();
    const diurnal = Math.sin((h / 24) * Math.PI * 2) * 0.4;
    const noisy = status === "degraded" && rnd() < 0.25;
    readings.push({
      t,
      sst: round1(baseSst + diurnal + gauss(0, noisy ? 1.2 : 0.25)),
      ph: round2(clamp(8.1 - zone.drivers.sstAnomaly * 0.05 + gauss(0, 0.02), 7.7, 8.3)),
      turbidity: round1(clamp(gauss(status === "degraded" ? 6 : 2.5, 1.5) + (rnd() < 0.08 ? rand(4, 10) : 0), 0.2, 20)),
    });
  }
  buoys.push({ id, zoneId: zone.id, coords: [round2(zone.centroid[0] + gauss(0, 0.4)), round2(zone.centroid[1] + gauss(0, 0.4))], readings, status });
}

// ---------------------------------------------------------------------------
// VESSELS — 6, two orgs
// ---------------------------------------------------------------------------
const VESSEL_DEFS = [
  { id: "V-01", name: "RV Meridian", org: "Blue Sentinel Trust", zone: "Z-02" },
  { id: "V-02", name: "MV Kaito", org: "Blue Sentinel Trust", zone: "Z-06" },
  { id: "V-03", name: "RV Sentinel", org: "Blue Sentinel Trust", zone: "Z-03" },
  { id: "V-04", name: "MV Nusantara", org: "Coastal Response Agency", zone: "Z-04" },
  { id: "V-05", name: "RV Aldebaran", org: "Coastal Response Agency", zone: "Z-01" },
  { id: "V-06", name: "MV Tanjung", org: "Coastal Response Agency", zone: "Z-07" },
];
const vessels = VESSEL_DEFS.map((v, i) => {
  const zone = zoneById[v.zone];
  const dispatched = i === 1 || i === 4;
  return {
    id: v.id,
    name: v.name,
    org: v.org,
    coords: [round2(zone.centroid[0] + gauss(0, 0.5)), round2(zone.centroid[1] + gauss(0, 0.5))],
    status: dispatched ? "dispatched" : "available",
    etaMinutes: dispatched ? randInt(35, 180) : undefined,
  };
});

// link assigned incidents to a vessel
const assignedIncidents = incidents.filter((inc) => inc.status === "assigned");
assignedIncidents.forEach((inc, i) => {
  inc.assignedTo = vessels[i % vessels.length].id;
});

// ---------------------------------------------------------------------------
// FORECAST — 8 zones × 30 days, CI band widens with horizon
// ---------------------------------------------------------------------------
const forecasts = zones.map((z) => {
  const points = [];
  let risk = z.riskScore;
  const bias = z.riskDelta > 0 ? 0.4 : -0.2;
  for (let day = 1; day <= 30; day++) {
    risk = clamp(risk + bias + gauss(0, 1.1), 3, 100);
    const t = new Date(NOW + day * DAY).toISOString().slice(0, 10);
    const band = 3 + day * 0.6; // widens with horizon
    points.push({
      t,
      risk: Math.round(risk),
      lower: Math.round(clamp(risk - band, 0, 100)),
      upper: Math.round(clamp(risk + band, 0, 100)),
    });
  }
  return { zoneId: z.id, points };
});

// ---------------------------------------------------------------------------
// write
// ---------------------------------------------------------------------------
async function run() {
  await mkdir(OUT, { recursive: true });
  const files = {
    "zones.json": zones,
    "incidents.json": incidents,
    "species.json": species,
    "buoys.json": buoys,
    "vessels.json": vessels,
    "forecast.json": forecasts,
  };
  let total = 0;
  for (const [name, data] of Object.entries(files)) {
    const json = JSON.stringify(data, null, 2) + "\n";
    total += Buffer.byteLength(json);
    await writeFile(path.join(OUT, name), json);
    console.log(`  ✓ ${name.padEnd(16)} ${Array.isArray(data) ? data.length : "?"} records · ${(Buffer.byteLength(json) / 1024).toFixed(0)}KB`);
  }
  const lowConf = incidents.filter((i) => i.ai.confidence < 0.7).length;
  const sev = incidents.reduce((a, i) => ((a[i.severity] = (a[i.severity] || 0) + 1), a), {});
  console.log(`\n  total ${(total / 1024).toFixed(0)}KB · severity ${JSON.stringify(sev)} · ${lowConf} below 0.70`);
  console.log(`  zone risk: ${zones.map((z) => `${z.id}=${z.riskScore}`).join(" ")}`);
}
run().catch((e) => { console.error(e); process.exit(1); });
