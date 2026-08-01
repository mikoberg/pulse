import { config } from "../config.js";
import { parseICS } from "../ics.js";
import type { Decision } from "../decision.js";

const LOOKAHEAD_DAYS = 7;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Is a confirmed date close enough that reserving time now is still useful.
export async function launchDecision(): Promise<Decision | null> {
  const res = await fetch(config.launch.icsUrl);
  if (!res.ok) throw new Error(`Launch calendar fetch returned ${res.status}`);
  const events = parseICS(await res.text());

  const now = new Date();
  const horizon = new Date(now.getTime() + LOOKAHEAD_DAYS * 24 * 60 * 60 * 1000);
  const next = events
    .filter((e) => e.start > now && e.start <= horizon)
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
  if (!next) return null;

  const weekday = WEEKDAYS[next.start.getDay()];
  return {
    action: `Reserve ${weekday}.`,
    reason: `${next.summary} is confirmed for ${weekday}.`,
    priority: 40,
    url: next.url,
  };
}
