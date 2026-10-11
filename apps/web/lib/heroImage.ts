import fs from "node:fs";
import path from "node:path";

const CANDIDATES = ["pitch.avif", "pitch.webp", "pitch.jpg", "pitch.png"] as const;

export type HeroImage = { src: string; width: number; height: number } | null;

/**
 * Return the public path of the hero image if one of the supported files
 * exists under /public/hero. Returns null otherwise so callers can render
 * the designed SVG fallback.
 */
export function findHeroImage(): HeroImage {
  const dir = path.join(process.cwd(), "public", "hero");
  for (const name of CANDIDATES) {
    try {
      if (fs.existsSync(path.join(dir, name))) {
        return { src: `/hero/${name}`, width: 2400, height: 1350 };
      }
    } catch {
      // fs access can fail in restricted runtimes; fall through.
    }
  }
  return null;
}
