import { test } from "node:test";
import assert from "node:assert/strict";

process.env.PULSE_CALENDAR_ICS_URL ??= "https://x";
process.env.PULSE_LAUNCH_ICS_URL ??= "https://x";
process.env.PULSE_GITHUB_OWNER ??= "a";
process.env.PULSE_GITHUB_REPO ??= "b";

const { chooseDecision, shouldShowHorizon, HIGH_URGENCY_THRESHOLD } = await import("./build.js");

function decision(priority: number, action = "Do it.") {
  return { action, reason: "because", priority, url: undefined };
}

test("chooseDecision returns null when nothing is active", () => {
  assert.equal(chooseDecision([]), null);
});

test("chooseDecision picks the single highest-priority decision", () => {
  const d = chooseDecision([decision(40), decision(100, "Fix it."), decision(60)]);
  assert.equal(d?.action, "Fix it.");
});

test("shouldShowHorizon is true when there's no decision", () => {
  assert.equal(shouldShowHorizon(null), true);
});

test("shouldShowHorizon is true for a low-urgency decision", () => {
  assert.equal(shouldShowHorizon(decision(HIGH_URGENCY_THRESHOLD - 1)), true);
});

test("shouldShowHorizon is false at and above the urgency threshold", () => {
  assert.equal(shouldShowHorizon(decision(HIGH_URGENCY_THRESHOLD)), false);
  assert.equal(shouldShowHorizon(decision(100)), false);
});
