/* Unit tests for keycodes.js using Node's built-in test runner */
const assert = require("node:assert/strict");
const {test, describe} = require("node:test");
const KEY_CODES = require("../../keycodes.js");

describe("keycodes", () => {
  test("contains all common remote control key codes", () => {
    assert.equal(typeof KEY_CODES, "object");
    assert.equal(KEY_CODES[1], "KEY_ESC");
    assert.equal(KEY_CODES[103], "KEY_UP");
    assert.equal(KEY_CODES[105], "KEY_LEFT");
    assert.equal(KEY_CODES[106], "KEY_RIGHT");
    assert.equal(KEY_CODES[108], "KEY_DOWN");
  });

  test("contains media control keys", () => {
    assert.equal(KEY_CODES[113], "KEY_MUTE");
    assert.equal(KEY_CODES[114], "KEY_VOLUMEDOWN");
    assert.equal(KEY_CODES[115], "KEY_VOLUMEUP");
    assert.equal(KEY_CODES[116], "KEY_POWER");
  });

  test("contains playback control keys", () => {
    assert.equal(KEY_CODES[164], "KEY_PLAYPAUSE");
    assert.equal(KEY_CODES[163], "KEY_NEXTSONG");
    assert.equal(KEY_CODES[165], "KEY_PREVIOUSSONG");
  });

  test("maps numeric key codes to strings", () => {
    for (const [code, name] of Object.entries(KEY_CODES)) {
      assert.equal(typeof code, "string");
      assert.equal(typeof name, "string");
      assert.match(name, /^KEY_/u);
    }
  });

  test("can map multiple codes to the same key name", () => {
    // Different hardware may emit different codes for the same key
    const fastforward207 = KEY_CODES["207"];
    const fastforward208 = KEY_CODES["208"];
    assert.equal(fastforward207, fastforward208);
    assert.equal(fastforward207, "KEY_FASTFORWARD");
  });

  test("has positive numeric keys", () => {
    for (const code of Object.keys(KEY_CODES)) {
      assert.ok(Number(code) >= 0, `Code ${code} should be a non-negative number`);
    }
  });
});
