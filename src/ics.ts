export interface IcsEvent {
  start: Date;
  summary: string;
  url?: string;
}

// Minimal on-purpose: DTSTART, SUMMARY, URL only, timed events only
// (all-day events have no clock time, so they're skipped by parseTime).
export function parseICS(text: string): IcsEvent[] {
  const events: IcsEvent[] = [];
  for (const block of text.split("BEGIN:VEVENT").slice(1)) {
    const start = parseICSTime(block.match(/^DTSTART[^:\r\n]*:([^\r\n]+)/m)?.[1]);
    if (!start) continue;
    events.push({
      start,
      summary: block.match(/^SUMMARY:([^\r\n]+)/m)?.[1] ?? "Untitled event",
      url: block.match(/^URL:([^\r\n]+)/m)?.[1],
    });
  }
  return events;
}

function parseICSTime(value?: string): Date | null {
  const m = value?.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}${z ?? ""}`);
}
