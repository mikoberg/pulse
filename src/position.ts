// Position: permanent, judgment-free calendar orientation. Never a decision,
// never a status readout — just where we are in the tech launch year.
const SEASONS: Array<{ name: string; startMonth: number; startDay: number; endMonth: number; endDay: number }> = [
  { name: "Galaxy Unpacked", startMonth: 1, startDay: 15, endMonth: 1, endDay: 31 },
  { name: "MWC", startMonth: 2, startDay: 24, endMonth: 2, endDay: 28 },
  { name: "Google I/O", startMonth: 5, startDay: 10, endMonth: 5, endDay: 21 },
  { name: "WWDC", startMonth: 6, startDay: 5, endMonth: 6, endDay: 15 },
  { name: "Galaxy Unpacked", startMonth: 7, startDay: 20, endMonth: 8, endDay: 10 },
  { name: "IFA", startMonth: 9, startDay: 1, endMonth: 9, endDay: 10 },
  { name: "Apple event", startMonth: 9, startDay: 5, endMonth: 9, endDay: 15 },
  { name: "Pixel launch", startMonth: 10, startDay: 1, endMonth: 10, endDay: 15 },
];

function dayOfYear(month: number, day: number, year: number): number {
  return Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86400000);
}

export function position(now: Date = new Date()): string {
  const year = now.getUTCFullYear();
  const today = dayOfYear(now.getUTCMonth() + 1, now.getUTCDate(), year);

  for (const s of SEASONS) {
    const start = dayOfYear(s.startMonth, s.startDay, year);
    const end = dayOfYear(s.endMonth, s.endDay, year);
    if (today >= start && today <= end) return `${s.name} season`;
  }

  let closest: { name: string; days: number } | null = null;
  for (const s of SEASONS) {
    let start = dayOfYear(s.startMonth, s.startDay, year);
    if (start < today) start = dayOfYear(s.startMonth, s.startDay, year + 1);
    const days = start - today;
    if (!closest || days < closest.days) closest = { name: s.name, days };
  }
  if (!closest) return "";

  const weeks = Math.round(closest.days / 7);
  if (weeks <= 0) return `${closest.name} this week`;
  if (weeks === 1) return `${closest.name} in 1 week`;
  return `${closest.name} in ${weeks} weeks`;
}
