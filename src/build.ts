import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { githubDecision } from "./signals/github.js";
import { calendarDecision } from "./signals/calendar.js";
import { weatherDecision } from "./signals/weather.js";
import { launchDecision } from "./signals/launch.js";
import { calendarHorizon, launchHorizon } from "./horizon.js";
import { renderPage } from "./render.js";
import { position } from "./position.js";
import type { Decision } from "./decision.js";
import type { HorizonFact } from "./horizon.js";

const SIGNALS: Array<{ name: string; run: () => Promise<Decision | null> }> = [
  { name: "github", run: githubDecision },
  { name: "calendar", run: calendarDecision },
  { name: "weather", run: weatherDecision },
  { name: "launch", run: launchDecision },
];

// A high-urgency decision (a broken build, a departure countdown) gets the
// whole page. Horizon only appears when there's room for it to not compete.
export const HIGH_URGENCY_THRESHOLD = 70;

export function chooseDecision(active: Decision[]): Decision | null {
  return active.length > 0 ? active.reduce((best, d) => (d.priority > best.priority ? d : best)) : null;
}

export function shouldShowHorizon(chosen: Decision | null): boolean {
  return !chosen || chosen.priority < HIGH_URGENCY_THRESHOLD;
}

async function safely<T>(name: string, run: () => Promise<T | null>): Promise<T | null> {
  try {
    return await run();
  } catch (err) {
    console.warn(`[pulse] ${name} failed: ${(err as Error).message}`);
    return null;
  }
}

async function main() {
  const now = new Date();

  const results = await Promise.all(SIGNALS.map((s) => safely(s.name, s.run)));
  const active = results.filter((r): r is Decision => r !== null);
  const chosen = chooseDecision(active);

  let horizon: HorizonFact[] = [];
  if (shouldShowHorizon(chosen)) {
    const [cal, launch] = await Promise.all([
      safely("calendar-horizon", () => calendarHorizon(now)),
      safely("launch-horizon", () => launchHorizon(now)),
    ]);
    horizon = [cal, launch].filter((h): h is HorizonFact => h !== null);
  }

  const html = renderPage(chosen, horizon, position(now), now);

  await mkdir("dist", { recursive: true });
  await writeFile("dist/index.html", html, "utf-8");

  console.log(
    `[pulse] built dist/index.html — ` +
      (chosen ? `"${chosen.action}"` : "nothing needs attention") +
      `, ${horizon.length} horizon fact(s)`
  );
}

// Only run when executed directly (`npm run build`), not when imported for tests.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((err) => {
    console.error("[pulse] build failed:", err);
    process.exitCode = 1;
  });
}
