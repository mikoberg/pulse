import { test } from "node:test";
import assert from "node:assert/strict";
import { position } from "./position.js";

test("returns weekday and month, never empty, never evaluative", () => {
  const result = position(new Date(Date.UTC(2026, 7, 1, 12)));
  assert.equal(result, "Saturday · August");
});

test("always resolves for every month", () => {
  for (let m = 0; m < 12; m++) {
    const result = position(new Date(Date.UTC(2026, m, 15, 12)));
    assert.notEqual(result, "");
    assert.doesNotMatch(result, /quiet|nothing|good|bad|season/i);
  }
});
