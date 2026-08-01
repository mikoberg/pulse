import { mkdir, writeFile } from "node:fs/promises";
import { githubDecision } from "./signals/github.js";
import { calendarDecision } from "./signals/calendar.js";
import { weatherDecision } from "./signals/weather.js";
import { launchDecision } from "./signals/launch.js";
import { renderPage } from "./render.js";
import type { Decision } from "./decision.js";

const SIGNALS: Array<{ name: string; run: () => Promise<Decision | null> }> = [
  { name: "github", run: githubDecision },
  { name: "calendar", run: calendarDecision },
  { name: "weather", run: weatherDecision },
  { name: "launch", run: launchDecision },
];

async function main() {
  const results = await Promise.all(
    SIGNALS.map(async ({ name, run }) => {
      try {
        return await run();
      } catch (err) {
        // A fetch failure logs and goes silent — never takes the page down.
        console.warn(`[pulse] ${name} signal failed: ${(err as Error).message}`);
        return null;
      }
    })
  );

  // Exactly one decision is shown: the highest priority active one.
  const active = results.filter((r): r is Decision => r !== null);
  const chosen = active.length > 0
    ? active.reduce((best, d) => (d.priority > best.priority ? d : best))
    : null;

  const html = renderPage(chosen, new Date());

  await mkdir("dist", { recursive: true });
  await writeFile("dist/index.html", html, "utf-8");

  console.log(
    chosen
      ? `[pulse] built dist/index.html — "${chosen.action}" (priority ${chosen.priority}, ${active.length} active)`
      : `[pulse] built dist/index.html — nothing needs attention today`
  );
}

main().catch((err) => {
  console.error("[pulse] build failed:", err);
  process.exitCode = 1;
});
