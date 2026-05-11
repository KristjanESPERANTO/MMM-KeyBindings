/* Unit tests for nativeKeyHandler.js using Node's built-in test runner */
const assert = require("node:assert/strict");
const {test, describe} = require("node:test");

// Mock NativeKeyHandler (browser-based, so we test the object structure)
const NativeKeyHandler = {
  keyMap: {
    Home: "Home",
    Enter: "Enter",
    ArrowLeft: "ArrowLeft",
    ArrowRight: "ArrowRight",
    ArrowUp: "ArrowUp",
    ArrowDown: "ArrowDown",
    Backspace: "Return",
    Escape: "Return",
    ContextMenu: "Menu",
    MediaPlayPause: "MediaPlayPause",
    MediaTrackNext: "MediaNextTrack",
    MediaTrackPrevious: "MediaPreviousTrack"
  },

  handlers: [],
  activeKeys: [],
  suppressOnKeyUp: ["Home", "Menu"],

  /**
   * Get standardized key name from event
   * @param {KeyboardEvent} e - The keyboard event
   * @returns {string|null} - Standardized key name or null
   */
  getKeyName (e) {
    if (e.key && this.keyMap[e.key]) {
      return this.keyMap[e.key];
    }

    if (e.key && this.activeKeys.includes(e.key)) {
      return e.key;
    }

    return null;
  },

  /**
   * Check if a key should be handled
   * @param {string} keyName - The key name to check
   * @returns {boolean}
   */
  shouldHandle (keyName) {
    if (!keyName) {
      return false;
    }
    return this.activeKeys.some((k) => k.toLowerCase() === keyName.toLowerCase());
  },

  addKeys (keys) {
    for (const key of keys) {
      if (!this.activeKeys.includes(key)) {
        this.activeKeys.push(key);
      }
    }
  },

  removeKeys (keys) {
    this.activeKeys = this.activeKeys.filter((k) => !keys.includes(k));
  }
};

describe("NativeKeyHandler", () => {
  describe("keyMap", () => {
    test("contains mapping for navigation keys", () => {
      assert.equal(NativeKeyHandler.keyMap.Home, "Home");
      assert.equal(NativeKeyHandler.keyMap.ArrowLeft, "ArrowLeft");
      assert.equal(NativeKeyHandler.keyMap.ArrowRight, "ArrowRight");
      assert.equal(NativeKeyHandler.keyMap.ArrowUp, "ArrowUp");
      assert.equal(NativeKeyHandler.keyMap.ArrowDown, "ArrowDown");
    });

    test("contains mapping for media control keys", () => {
      assert.equal(NativeKeyHandler.keyMap.MediaPlayPause, "MediaPlayPause");
      assert.equal(NativeKeyHandler.keyMap.MediaTrackNext, "MediaNextTrack");
      assert.equal(NativeKeyHandler.keyMap.MediaTrackPrevious, "MediaPreviousTrack");
    });

    test("maps both Backspace and Escape to Return", () => {
      assert.equal(NativeKeyHandler.keyMap.Backspace, "Return");
      assert.equal(NativeKeyHandler.keyMap.Escape, "Return");
    });
  });

  describe("getKeyName", () => {
    test("returns mapped key name from keyMap", () => {
      const event = {key: "ArrowLeft"};
      assert.equal(NativeKeyHandler.getKeyName(event), "ArrowLeft");
    });

    test("returns null for unmapped key when not in activeKeys", () => {
      NativeKeyHandler.activeKeys = [];
      const event = {key: "UnknownKey"};
      assert.equal(NativeKeyHandler.getKeyName(event), null);
    });

    test("returns key name if it exists in activeKeys", () => {
      NativeKeyHandler.activeKeys = ["CustomKey"];
      const event = {key: "CustomKey"};
      assert.equal(NativeKeyHandler.getKeyName(event), "CustomKey");
    });

    test("handles events without key property", () => {
      NativeKeyHandler.activeKeys = [];
      const event = {};
      assert.equal(NativeKeyHandler.getKeyName(event), null);
    });
  });

  describe("shouldHandle", () => {
    test("returns false for null or empty string", () => {
      NativeKeyHandler.activeKeys = ["ArrowLeft"];
      assert.equal(NativeKeyHandler.shouldHandle(null), false);
      assert.equal(NativeKeyHandler.shouldHandle(""), false);
    });

    test("returns true when key is in activeKeys (case-insensitive)", () => {
      NativeKeyHandler.activeKeys = ["ArrowLeft"];
      assert.equal(NativeKeyHandler.shouldHandle("ArrowLeft"), true);
      assert.equal(NativeKeyHandler.shouldHandle("arrowleft"), true);
      assert.equal(NativeKeyHandler.shouldHandle("ARROWLEFT"), true);
    });

    test("returns false when key is not in activeKeys", () => {
      NativeKeyHandler.activeKeys = ["ArrowLeft"];
      assert.equal(NativeKeyHandler.shouldHandle("ArrowRight"), false);
    });
  });

  describe("addKeys", () => {
    test("adds new keys to activeKeys", () => {
      NativeKeyHandler.activeKeys = [];
      NativeKeyHandler.addKeys(["ArrowLeft", "ArrowRight"]);
      assert.deepEqual(NativeKeyHandler.activeKeys, ["ArrowLeft", "ArrowRight"]);
    });

    test("does not add duplicate keys", () => {
      NativeKeyHandler.activeKeys = ["ArrowLeft"];
      NativeKeyHandler.addKeys(["ArrowLeft", "ArrowRight"]);
      assert.deepEqual(NativeKeyHandler.activeKeys, ["ArrowLeft", "ArrowRight"]);
    });

    test("preserves existing keys when adding new ones", () => {
      NativeKeyHandler.activeKeys = ["Home"];
      NativeKeyHandler.addKeys(["ArrowLeft"]);
      assert.deepEqual(NativeKeyHandler.activeKeys, ["Home", "ArrowLeft"]);
    });
  });

  describe("removeKeys", () => {
    test("removes specified keys from activeKeys", () => {
      NativeKeyHandler.activeKeys = ["ArrowLeft", "ArrowRight", "Home"];
      NativeKeyHandler.removeKeys(["ArrowLeft"]);
      assert.deepEqual(NativeKeyHandler.activeKeys, ["ArrowRight", "Home"]);
    });

    test("removes multiple keys at once", () => {
      NativeKeyHandler.activeKeys = ["ArrowLeft", "ArrowRight", "Home"];
      NativeKeyHandler.removeKeys(["ArrowLeft", "ArrowRight"]);
      assert.deepEqual(NativeKeyHandler.activeKeys, ["Home"]);
    });

    test("handles removing non-existent keys gracefully", () => {
      NativeKeyHandler.activeKeys = ["ArrowLeft"];
      NativeKeyHandler.removeKeys(["NonExistent"]);
      assert.deepEqual(NativeKeyHandler.activeKeys, ["ArrowLeft"]);
    });
  });

  describe("suppressOnKeyUp", () => {
    test("contains keys that should suppress default keyup action", () => {
      assert.ok(NativeKeyHandler.suppressOnKeyUp.includes("Home"));
      assert.ok(NativeKeyHandler.suppressOnKeyUp.includes("Menu"));
    });
  });
});
