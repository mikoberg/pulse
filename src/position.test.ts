import { test } from "node:test";
import assert from "node:assert/strict";
import { position } from "./position.js";

test("inside a season window returns '<name> season'", () => {
  assert.equal(position(new Date(Date.UTC(2026, 5, 10))), "WWDC season");
});

test("outside a season window returns distance to the nearest one", () => {
  const result = position(new Date(Date.UTC(2026, 10, 1))); // between Pixel and next Unpacked
  assert.match(result, /^Galaxy Unpacked (in \d+ weeks?|this week)$/);
});

test("never returns an evaluative or empty string", () => {
  for (let m = 0; m < 12; m++) {
    const result = position(new Date(Date.UTC(2026, m, 15)));
    assert.notEqual(result, "");
    assert.doesNotMatch(result, /quiet|nothing|good|bad|big/i);
  }
});
