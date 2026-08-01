import { test } from "node:test";
import assert from "node:assert/strict";

process.env.PULSE_CALENDAR_ICS_URL ??= "https://x";
process.env.PULSE_LAUNCH_ICS_URL ??= "https://x";
process.env.PULSE_GITHUB_OWNER ??= "a";
process.env.PULSE_GITHUB_REPO ??= "b";

const { calendarHorizon, launchHorizon } = await import("./horizon.js");

function icsFor(date: Date, summary: string, url?: string): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
  return `BEGIN:VCALENDAR\nBEGIN:VEVENT\nDTSTART:${stamp}\nSUMMARY:${summary}\n${url ? `URL:${url}\n` : ""}END:VEVENT\nEND:VCALENDAR`;
}

test("calendarHorizon skips events within the next 24h (already Decision territory)", async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  globalThis.fetch = (async () => ({ ok: true, text: async () => icsFor(soon, "Gym") })) as unknown as typeof fetch;
  assert.equal(await calendarHorizon(now), null);
});

test("calendarHorizon surfaces an event 2 days out, formatted with a relative day and time", async () => {
  const now = new Date();
  const twoDays = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  globalThis.fetch = (async () => ({ ok: true, text: async () => icsFor(twoDays, "Gym", "https://x/gym") })) as unknown as typeof fetch;
  const result = await calendarHorizon(now);
  assert.equal(result?.title, "Gym");
  assert.equal(result?.url, "https://x/gym");
  assert.match(result!.when, /•/);
});

test("calendarHorizon stays silent beyond its window", async () => {
  const now = new Date();
  const farOut = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);
  globalThis.fetch = (async () => ({ ok: true, text: async () => icsFor(farOut, "Gym") })) as unknown as typeof fetch;
  assert.equal(await calendarHorizon(now), null);
});

test("launchHorizon skips events within the next 7 days (already Decision territory)", async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  globalThis.fetch = (async () => ({ ok: true, text: async () => icsFor(soon, "Some Launch") })) as unknown as typeof fetch;
  assert.equal(await launchHorizon(now), null);
});

test("launchHorizon surfaces a confirmed event further out, formatted as a plain date", async () => {
  const now = new Date();
  const threeWeeks = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);
  globalThis.fetch = (async () => ({ ok: true, text: async () => icsFor(threeWeeks, "Some Launch") })) as unknown as typeof fetch;
  const result = await launchHorizon(now);
  assert.equal(result?.title, "Some Launch");
  assert.match(result!.when, /^[A-Z][a-z]+, [A-Z][a-z]{2} \d{1,2}$/);
});
