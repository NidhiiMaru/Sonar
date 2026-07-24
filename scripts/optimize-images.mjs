/**
 * Optimise the licence-cleared source imagery (assets/) into public/images/,
 * resized and recompressed, and emit a dimensions manifest so next/image can
 * always ship explicit width/height (kills CLS). Run: `node scripts/optimize-images.mjs`.
 */
import sharp from "sharp";
import { mkdir, writeFile, cp } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "assets", "images");
const OUT = path.join(ROOT, "public", "images");

// key -> { file (relative to assets/images), maxW, quality }
const SELECTION = {
  // Species (12) — matched 1:1 to species.json
  "sp-dumbo-octopus": { file: "species/dumbo-octopus-noaa-01.jpg", maxW: 1200 },
  "sp-anglerfish": { file: "species/anglerfish-chaunacops-noaa-01.jpg", maxW: 1200 },
  "sp-tubeworms": { file: "species/tubeworms-hydrothermal-noaa-01.jpg", maxW: 1200 },
  "sp-sea-turtle": { file: "species/sea-turtle-01.jpg", maxW: 1200 },
  "sp-humpback": { file: "species/humpback-whale-01.jpg", maxW: 1200 },
  "sp-sixgill-shark": { file: "species/shark-01.jpg", maxW: 1200 },
  "sp-crown-of-thorns": { file: "species/crown-of-thorns-starfish-noaa-01.jpg", maxW: 1200 },
  "sp-pink-jelly": { file: "species/pink-jellyfish-noaa-02.jpg", maxW: 1200 },
  "sp-bamboo-coral": { file: "species/deep-sea-coral-garden-noaa-01.jpg", maxW: 1200 },
  "sp-rockfish": { file: "species/rockfish-deep-sea-coral-noaa-01.jpg", maxW: 1200 },
  "sp-red-crab": { file: "species/crab-anemone-noaa-01.jpg", maxW: 1200 },
  "sp-lobe-coral": { file: "species/bleached-coral-01.jpg", maxW: 1200 }, // CC0

  // Pollution / incident evidence frames
  "ev-ghostnet-turtle": { file: "pollution/ghost-net-turtle-entangled-noaa-01.jpg", maxW: 1200 },
  "ev-ghostnet": { file: "pollution/ghost-net-puget-sound-01.jpg", maxW: 1200 },
  "ev-plastic-bottle": { file: "pollution/plastic-bottle-ocean-02.jpg", maxW: 1200 },
  "ev-plastic-dark": { file: "pollution/plastic-bottles-dark-water-03.jpg", maxW: 1200 },
  "ev-plastic-shore": { file: "pollution/plastic-waste-shore-05.jpg", maxW: 1200 },
  "ev-bleached": { file: "species/bleached-coral-01.jpg", maxW: 1200 }, // CC0, reused for bleaching evidence

  // Hero + section imagery
  "hero-main": { file: "hero/hero-light-shafts-01.jpg", maxW: 2000, quality: 72 },
  "hero-rov": { file: "hero/hero-rov-deep-noaa-05.jpg", maxW: 2000, quality: 72 },
  "hero-jelly": { file: "hero/hero-jellyfish-deep-04.jpg", maxW: 2000, quality: 72 },
  "hero-bubbles": { file: "hero/hero-bubbles-sunlight-06.jpg", maxW: 2000, quality: 72 },
  "hero-submerged": { file: "hero/hero-light-beams-submerged-03.jpg", maxW: 2000, quality: 72 },

  // How-it-works / tech
  "tech-auv": { file: "tech/auv-sentry-noaa-01.jpg", maxW: 1000 },
  "tech-rov-benthic": { file: "tech/rov-benthic-survey-noaa-02.jpg", maxW: 1000 },
  "tech-sonar": { file: "tech/sonar-bathymetry-noaa-04.jpg", maxW: 1000 },
  "tech-rov-launch": { file: "tech/rov-launch-prep-noaa-03.jpg", maxW: 1000 },
};

async function run() {
  await mkdir(OUT, { recursive: true });
  const manifest = {};
  let total = 0;

  for (const [key, cfg] of Object.entries(SELECTION)) {
    const src = path.join(SRC, cfg.file);
    if (!existsSync(src)) {
      console.error(`  ✗ missing source: ${cfg.file}`);
      process.exitCode = 1;
      continue;
    }
    const outFile = path.join(OUT, `${key}.jpg`);
    const info = await sharp(src)
      .rotate()
      .resize({ width: cfg.maxW, withoutEnlargement: true })
      .jpeg({ quality: cfg.quality ?? 80, mozjpeg: true })
      .toFile(outFile);
    manifest[key] = { src: `/images/${key}.jpg`, width: info.width, height: info.height };
    total += info.size;
    console.log(`  ✓ ${key.padEnd(20)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)}KB`);
  }

  // Poster still for the hero video (lightweight, from hero-main source)
  const posterInfo = await sharp(path.join(SRC, "hero/hero-light-shafts-01.jpg"))
    .resize({ width: 1280, withoutEnlargement: true })
    .jpeg({ quality: 60, mozjpeg: true })
    .toFile(path.join(OUT, "hero-poster.jpg"));
  manifest["hero-poster"] = { src: "/images/hero-poster.jpg", width: posterInfo.width, height: posterInfo.height };

  // One light hero video loop
  const vidOut = path.join(ROOT, "public", "video");
  await mkdir(vidOut, { recursive: true });
  await cp(path.join(ROOT, "assets", "video", "diving-deep-blue-04.mp4"), path.join(vidOut, "hero.mp4"));

  // Tech-stack logos (svg, copied as-is)
  const logoOut = path.join(ROOT, "public", "logos");
  await cp(path.join(ROOT, "assets", "logos"), logoOut, { recursive: true });

  await writeFile(
    path.join(ROOT, "src", "lib", "image-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(`\n  ${Object.keys(manifest).length} images · ${(total / 1024 / 1024).toFixed(1)}MB total (excl. video)`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
