import { config } from "../config.js";
import { parseICS } from "../ics.js";
import type { Decision } from "../decision.js";

// Is there something starting soon enough that leaving-time is the decision.
export async function calendarDecision(): Promise<Decision | null> {
  const res = await fetch(config.calendar.icsUrl);
  if (!res.ok) throw new Error(`Calendar fetch returned ${res.status}`);
  const events = parseICS(await res.text());

  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const next = events
    .filter((e) => e.start > now && e.start <= horizon)
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
  if (!next) return null;

  const leaveAt = new Date(next.start.getTime() - config.calendar.travelMinutes * 60 * 1000);
  const minutesUntilLeave = Math.round((leaveAt.getTime() - now.getTime()) / 60000);
  const startTime = next.start.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return {
    action: minutesUntilLeave <= 0 ? "Leave now." : `Leave in ${minutesUntilLeave} minutes.`,
    reason: `"${next.summary}" starts at ${startTime}, ${config.calendar.travelMinutes} min away.`,
    priority: 80,
    url: next.url,
  };
}
