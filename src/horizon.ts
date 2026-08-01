import { config } from "./config.js";
import { parseICS } from "./ics.js";

export interface HorizonFact {
  title: string;
  when: string;
  url?: string;
}

const CALENDAR_NEAR_HOURS = 24; // already covered by the Decision layer
const CALENDAR_HORIZON_DAYS = 4;
const LAUNCH_NEAR_DAYS = 7; // already covered by the Decision layer
const LAUNCH_HORIZON_DAYS = 45;

export async function calendarHorizon(now: Date = new Date()): Promise<HorizonFact | null> {
  const res = await fetch(config.calendar.icsUrl);
  if (!res.ok) throw new Error(`Calendar fetch returned ${res.status}`);
  const events = parseICS(await res.text());

  const near = new Date(now.getTime() + CALENDAR_NEAR_HOURS * 60 * 60 * 1000);
  const horizon = new Date(now.getTime() + CALENDAR_HORIZON_DAYS * 24 * 60 * 60 * 1000);
  const next = events
    .filter((e) => e.start > near && e.start <= horizon)
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
  if (!next) return null;

  return { title: next.summary, when: formatWithTime(next.start, now), url: next.url };
}

export async function launchHorizon(now: Date = new Date()): Promise<HorizonFact | null> {
  const res = await fetch(config.launch.icsUrl);
  if (!res.ok) throw new Error(`Launch calendar fetch returned ${res.status}`);
  const events = parseICS(await res.text());

  const near = new Date(now.getTime() + LAUNCH_NEAR_DAYS * 24 * 60 * 60 * 1000);
  const horizon = new Date(now.getTime() + LAUNCH_HORIZON_DAYS * 24 * 60 * 60 * 1000);
  const next = events
    .filter((e) => e.start > near && e.start <= horizon)
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
  if (!next) return null;

  return { title: next.summary, when: formatDateOnly(next.start), url: next.url };
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatWithTime(date: Date, now: Date): string {
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (sameDay(date, now)) return `Today • ${time}`;
  if (sameDay(date, tomorrow)) return `Tomorrow • ${time}`;
  return `${WEEKDAYS[date.getDay()]} • ${time}`;
}

function formatDateOnly(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}
