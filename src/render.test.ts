import { test } from "node:test";
import assert from "node:assert/strict";
import { renderPage } from "./render.js";

const now = new Date(Date.UTC(2026, 7, 1, 12, 0));

test("escapes HTML in decision and horizon content", () => {
  const html = renderPage(
    { action: "<script>alert(1)</script>", reason: "R&D update", priority: 50 },
    [{ title: "Tom & Jerry <2>", when: "Today" }],
    "Saturday · August",
    now
  );
  assert.doesNotMatch(html, /<script>alert/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /R&amp;D update/);
  assert.match(html, /Tom &amp; Jerry &lt;2&gt;/);
});

test("empty state renders exactly one message and no horizon block", () => {
  const html = renderPage(null, [], "Saturday · August", now);
  assert.match(html, /Nothing needs you today\./);
  assert.doesNotMatch(html, /class="horizon"/);
});

test("a decision with a url wraps the whole block in one link", () => {
  const html = renderPage(
    { action: "Fix deployment first.", reason: "main is failing", priority: 100, url: "https://x/run" },
    [],
    "Saturday · August",
    now
  );
  const matches = html.match(/<a class="decision-link"/g) ?? [];
  assert.equal(matches.length, 1);
  assert.match(html, /href="https:\/\/x\/run"/);
});

test("a decision without a url renders no link at all", () => {
  const html = renderPage({ action: "Take a jacket.", reason: "cold", priority: 60 }, [], "Saturday · August", now);
  assert.doesNotMatch(html, /<a class="decision-link"/);
});

test("horizon items without a url render as plain divs, not links", () => {
  const html = renderPage(null, [{ title: "Gym", when: "Tomorrow • 19:00" }], "Saturday · August", now);
  assert.doesNotMatch(html, /<a class="horizon-item"/);
  assert.match(html, /<div class="horizon-item">/);
});

test("never renders more than the two horizon facts it's given", () => {
  const html = renderPage(
    null,
    [
      { title: "Gym", when: "Tomorrow • 19:00" },
      { title: "Launch", when: "Thursday, Aug 7" },
    ],
    "Saturday · August",
    now
  );
  const matches = html.match(/class="horizon-title"/g) ?? [];
  assert.equal(matches.length, 2);
});
