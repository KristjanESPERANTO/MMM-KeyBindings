/* Unit tests for keyHandler.js using Node's built-in test runner */
const assert = require("node:assert/strict");
const {test, describe} = require("node:test");

/**
 * Swap keys and values of a plain object.
 * Used to build reverse lookup maps (value → key).
 * @param {object} map - The object to invert
 * @returns {object} A new object with keys and values swapped
 */
function invertMap (map) {
  return Object.fromEntries(Object.entries(map).map(([k, v]) => [v, k]));
}

describe("invertMap utility function", () => {
  test("swaps keys and values correctly", () => {
    const input = {
      key1: "value1",
      key2: "value2",
      key3: "value3"
    };
    const output = invertMap(input);
    assert.deepEqual(output, {
      value1: "key1",
      value2: "key2",
      value3: "key3"
    });
  });

  test("handles empty object", () => {
    const input = {};
    const output = invertMap(input);
    assert.deepEqual(output, {});
  });

  test("handles single entry", () => {
    const input = {key: "value"};
    const output = invertMap(input);
    assert.deepEqual(output, {value: "key"});
  });

  test("handles special characters in keys and values", () => {
    const input = {
      KEY_LEFT: "ArrowLeft",
      KEY_RIGHT: "ArrowRight"
    };
    const output = invertMap(input);
    assert.deepEqual(output, {
      ArrowLeft: "KEY_LEFT",
      ArrowRight: "KEY_RIGHT"
    });
  });

  test("returns a new object (does not mutate input)", () => {
    const input = {key: "value"};
    const output = invertMap(input);
    assert.notEqual(input, output);
    assert.deepEqual(input, {key: "value"});
  });
});

describe("KeyHandler class", () => {
  // Mock KeyHandler for testing
  class KeyHandler {
    constructor () {
      this.defaults = {
        mode: "DEFAULT",
        map: {
          Right: "ArrowRight",
          Left: "ArrowLeft"
        },
        multiInstance: true,
        takeFocus: "Enter",
        debug: false
      };
    }

    init (name, config) {
      this.name = name;
      this.config = {
        ...this.defaults,
        ...config
      };

      this.currentMode = "DEFAULT";
      this.reverseMap = invertMap(this.config.map);
    }
  }

  test("creates instance with default configuration", () => {
    const handler = new KeyHandler();
    assert.equal(typeof handler.defaults, "object");
    assert.equal(handler.defaults.mode, "DEFAULT");
    assert.deepEqual(handler.defaults.map, {
      Right: "ArrowRight",
      Left: "ArrowLeft"
    });
  });

  test("initializes with custom configuration", () => {
    const handler = new KeyHandler();
    const customConfig = {
      mode: "CUSTOM",
      map: {
        Up: "ArrowUp",
        Down: "ArrowDown"
      }
    };
    handler.init("TestModule", customConfig);

    assert.equal(handler.name, "TestModule");
    assert.equal(handler.config.mode, "CUSTOM");
    assert.deepEqual(handler.config.map, {
      Up: "ArrowUp",
      Down: "ArrowDown"
    });
  });

  test("merges custom config with defaults", () => {
    const handler = new KeyHandler();
    const customConfig = {
      mode: "CUSTOM"
    };
    handler.init("TestModule", customConfig);

    assert.equal(handler.config.mode, "CUSTOM");
    assert.equal(handler.config.multiInstance, true); // from defaults
    assert.equal(handler.config.debug, false); // from defaults
  });

  test("builds reverse map correctly", () => {
    const handler = new KeyHandler();
    const customConfig = {
      map: {
        Right: "ArrowRight",
        Left: "ArrowLeft",
        Up: "ArrowUp"
      }
    };
    handler.init("TestModule", customConfig);

    assert.deepEqual(handler.reverseMap, {
      ArrowRight: "Right",
      ArrowLeft: "Left",
      ArrowUp: "Up"
    });
  });

  test("initializes with empty key map", () => {
    const handler = new KeyHandler();
    const customConfig = {
      map: {}
    };
    handler.init("TestModule", customConfig);

    assert.deepEqual(handler.config.map, {});
    assert.deepEqual(handler.reverseMap, {});
  });

  test("sets initial mode to DEFAULT", () => {
    const handler = new KeyHandler();
    handler.init("TestModule", {});

    assert.equal(handler.currentMode, "DEFAULT");
  });

  test("preserves custom mode from config", () => {
    const handler = new KeyHandler();
    const customConfig = {
      mode: "FOCUS"
    };
    handler.init("TestModule", customConfig);

    assert.equal(handler.config.mode, "FOCUS");
  });
});
