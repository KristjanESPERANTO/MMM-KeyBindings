# MMM-KeyBindings

**MMM-KeyBindings** is a module for [MagicMirror²](https://github.com/MagicMirrorOrg/MagicMirror/) that allows you to control your MagicMirror using a Bluetooth-connected remote (e.g. Amazon Fire Stick Remote) or a keyboard. It captures key presses and sends them as notifications for other modules to handle, allowing you to navigate and control your mirror without touching the screen.

The primary features are:

1. Customizable key map for Bluetooth remotes (Fire Stick and others). See: [Why Fire Stick?](https://github.com/shbatm/MMM-KeyBindings/wiki/Background-Information#WhyFire)
2. Customizable keyboard navigation — enable it with `enableKeyboard` and adjust the captured keys in the config.
3. Assign keys to perform actions automatically (e.g. toggle the monitor when HOME is long-pressed, using MMM-Remote-Control).
4. Allows a module to "take focus", so other modules ignore keypresses when a particular module is active (e.g. in a pop-up menu).
5. Supports multiple MagicMirror instances on different screens, independently controlled.

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/shbatm/MMM-KeyBindings
```

**That's it!** For standard keyboard usage, no `npm install` is required - the module has zero runtime dependencies.

### Advanced Setup (evdev / Bluetooth Remote)

For advanced control using something like the Amazon Fire TV Remote, continue with the following steps:

1. Connect your device and make sure it's recognized (for example, using the Desktop bluetooth device menu). See instructions [here](https://github.com/shbatm/MMM-KeyBindings/wiki/Remote-Setup)
2. Find the "Name" of the device using one of the two methods below:
   1. From a terminal run `cat /proc/bus/input/devices | grep "Name"` to get the Name to use
   2. From a terminal run `udevadm info -a -p $(udevadm info -q path -n /dev/input/event0) | grep ATTRS{name}`, assuming this is the only device connected. You may have to change `event0` to something else. Check `ls /dev/input/` to see which ones are currently connected.
3. Edit the `99-btremote.rules` file in this module's directory to use the name you found.
4. Run the setup script to install the udev rules:
   ```bash
   cd ~/MagicMirror/modules/MMM-KeyBindings
   ./setup-udev.sh
   ```
5. Add your user to the `input` group to allow reading input devices:
   ```bash
   sudo usermod -aG input $USER
   ```
   Then **logout and login again** (or reboot) for the change to take effect.
6. Configure `eventPath` in your module config (see Configuration options below). For the multi-interface udev setup, use an array containing `/dev/input/btremote-keyboard`, `/dev/input/btremote-media`, and `/dev/input/btremote-mouse`.

## Update

Just enter the module's directory and pull the update:

```bash
cd ~/MagicMirror/modules/MMM-KeyBindings
git pull
```

## Configuration

### Basic Usage

To use this module, add the following configuration block to the modules array in the `config/config.js` file:

```js
    {
      module: "MMM-KeyBindings",
      config: {
        // See below for configurable options
      }
    },
```

You can then configure other modules to handle the key presses and, if necessary, request focus so only that module will respond to the keys (e.g. for a menu). See [Handling Keys in Other Modules](https://github.com/shbatm/MMM-KeyBindings/wiki/Integration-into-Other-Modules)

### Configuration options

| Option             | Type         | Default                                                 | Description                                                                                                                                                                                                                                                                                                 |
| :----------------- | :----------- | :------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enableKeyboard`   | boolean      | `false`                                                 | Capture keys from a standard keyboard. Use `KeyboardEvent.key` names in `handleKeys`. Keep this `false` when the Bluetooth remote is also registered as a keyboard, otherwise events can be duplicated. The handler ignores focused form fields.                                                            |
| `enabledKeyStates` | string array | `['KEY_PRESSED', 'KEY_LONGPRESSED']`                    | Evdev key states that should be handled. The current reader emits `KEY_PRESSED` for a normal press and `KEY_LONGPRESSED` when a held key generates a repeat event.                                                                                                                                          |
| `handleKeys`       | string array | `[]`                                                    | Additional browser keyboard keys to capture. These are `KeyboardEvent.key` names such as `ArrowLeft`, `Home`, `Enter`, or `k`. This option affects keyboard input only.                                                                                                                                     |
| `disableKeys`      | string array | `[]`                                                    | Keys from the configured keyboard set to ignore. This option affects keyboard input only; use `keyMap` to control which evdev keys are recognized.                                                                                                                                                          |
| `evdev`            | object       | `{ enabled: true, eventPath: ['/dev/input/btremote'] }` | Configure the Linux evdev reader used for Bluetooth remotes. Set `enabled` to `false` for keyboard-only setups.                                                                                                                                                                                             |
| `evdev.enabled`    | boolean      | `true`                                                  | Enable or disable evdev input.                                                                                                                                                                                                                                                                              |
| `evdev.eventPath`  | string array | `['/dev/input/btremote']`                               | One or more paths to input event files, for example `['/dev/input/btremote-keyboard', '/dev/input/btremote-media', '/dev/input/btremote-mouse']`.                                                                                                                                                           |
| `keyMap`           | object       | See below                                               | Map the names used by MagicMirror and keyboard actions to Linux evdev key names reported by `evtest`, for example `ArrowRight: 'KEY_RIGHT'`. See the sample key map below.                                                                                                                                  |
| `actions`          | object array | See below                                               | Actions to run for matching key presses. An action sends a notification with `notification` and `payload`, or changes the key mode with `changeMode`. The default toggles the monitor through [MMM-Remote-Control](https://github.com/Jopyth/MMM-Remote-Control) when `Home` is long-pressed on the server. |

### Sample Configurations

#### Standard: Using a Fire TV Stick Remote

The config below uses the default [special keys](https://github.com/shbatm/MMM-KeyBindings/wiki/Background-Information#WhyFire) for the Fire TV Stick remote. Long-pressing `Home` sends the default `REMOTE_ACTION` notification; `MMM-Remote-Control` must be installed and configured to handle it before the monitor toggles. Keep `enableKeyboard` disabled while the same remote is also exposed as a keyboard device.

```js
    {
        module: 'MMM-KeyBindings',
        config: {
          enableKeyboard: false
        }
    },
```

#### Basic: Use Keyboard Only with Default Keys (no remote)

```js
    {
        module: 'MMM-KeyBindings',
        config: {
            evdev: { enabled: false },
            enableKeyboard: true,
        }
    },
```

### Remote Control Key Map

The following is the default key map for the Amazon Fire TV Stick remote. The object keys are the names used by MagicMirror and keyboard actions; the values are the Linux evdev names reported by `evtest`. Copy the map into your config to change the assignments.

```javascript
keyMap: {
    Home: "KEY_HOMEPAGE",
    Enter: "KEY_KPENTER",
    ArrowLeft: "KEY_LEFT",
    ArrowRight: "KEY_RIGHT",
    ArrowUp: "KEY_UP",
    ArrowDown: "KEY_DOWN",
    Menu: "KEY_MENU",
    MediaPlayPause: "KEY_PLAYPAUSE",
    MediaNextTrack: "KEY_FASTFORWARD",
    MediaPreviousTrack: "KEY_REWIND",
    Return: "KEY_BACK"
},
```

**If you are not using a Fire Stick Remote:** You may need to adjust the key assignments above to match your remote. See [Remote Setup](https://github.com/shbatm/MMM-KeyBindings/wiki/Remote-Setup) for how to run `evtest` and display the key names for your remote/device.

**Note about changing key names:** For example, map the remote's `KEY_RIGHT` to the action name `k`:

1. Add the whole `keyMap` above to your config section.
2. Change `ArrowRight: "KEY_RIGHT"` to `k: "KEY_RIGHT"`.
3. If you also want to press `k` on a keyboard, add it to `handleKeys: ['k']` (the native handler listens for `KeyboardEvent.key` names).

## Actions

This module receives key presses and sends them on for other modules to handle. You can customize the actions this module takes on certain keys by providing an array of action objects in the config.

### Action Objects

| Key            | Description                                                                                                                        |
| :------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| `key`          | The `keyName` to respond to.                                                                                                       |
| `state`        | Optional. Match `KEY_PRESSED` or `KEY_LONGPRESSED`; omit it to match either state.                                                 |
| `instance`     | Optional. Match `SERVER` for the main Mirror instance or `LOCAL` for a remote browser instance; omit it to match both.             |
| `mode`         | Optional. Match the current key press mode, such as `DEFAULT`.                                                                     |
| `notification` | The notification to send when the action matches. Use this together with `payload`, unless the action uses `changeMode`.           |
| `payload`      | Optional payload for `notification`.                                                                                               |
| `changeMode`   | Optional alternative to `notification` and `payload`. Changes the current key press mode, for example to `DEFAULT` or `DEMO_MODE`. |

### Examples

The following is an example Actions configuration to:

1. Toggle the monitor on/off when the Bluetooth remote's Home button is long-pressed (requires MMM-Remote-Control to handle command)
2. Change the slides in [MMM-Carousel w/ Slide Navigation](https://github.com/shbatm/MMM-Carousel) when the left or right buttons are pushed.
3. Exit whatever mode you're in, back to DEFAULT when Return is long pressed.

```javascript
actions: [
  {
    key: "Home",
    state: "KEY_LONGPRESSED",
    instance: "SERVER",
    mode: "DEFAULT",
    notification: "REMOTE_ACTION",
    payload: { action: "MONITORTOGGLE" }
  },
  {
    key: "ArrowLeft",
    state: "KEY_LONGPRESSED",
    notification: "CAROUSEL_PREVIOUS"
  },
  {
    key: "ArrowRight",
    state: "KEY_LONGPRESSED",
    notification: "CAROUSEL_NEXT"
  },
  {
    key: "Return",
    state: "KEY_LONGPRESSED",
    changeMode: "DEFAULT"
  }
],
```

## Handling Keys in Another Module

To handle key press events in your module, see this [wiki page](https://github.com/shbatm/MMM-KeyBindings/wiki/Integration-into-Other-Modules)

### Modern KeyHandler Registration

The recommended way to define a handler is to extend `KeyHandler` and register the class directly. This keeps the handler methods on the prototype and gives each instance its own runtime state.

```js
class CarouselKeyHandler extends KeyHandler {
  validKeyPress(kp) {
    if (kp.keyName === this.config.map.Left) {
      this.sendNotification("CAROUSEL_PREVIOUS");
    }

    if (kp.keyName === this.config.map.Right) {
      this.sendNotification("CAROUSEL_NEXT");
    }
  }

  onFocus() {
    Log.info(`${this.name} is ready for key navigation.`);
  }
}

KeyHandler.register("MMM-Carousel", CarouselKeyHandler);
```

## Development Path

This module was created as a stepping stone to allow other modules to be tweaked to respond to keyboard presses--mainly for navigation purposes. Please add any requests via the Issues for this repo.

**Using this module?** View a list of all modules that support MMM-KeyBindings on the wiki [here](https://github.com/shbatm/MMM-KeyBindings/wiki/Supported-Modules).

## Known Issues

- `KEY_LONGPRESSED` currently only comes from `evdev` on the main screen (Bluetooth remote path). Keyboard events use `KEY_PRESSED`.

## Contributing

If you find any problems, bugs or have questions, please [open a GitHub issue](https://github.com/shbatm/MMM-KeyBindings/issues) in this repository.

Pull requests are of course also very welcome 🙂

### Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

### Developer commands

- `npm install` - Install development dependencies.
- `node --run demo` - Start MagicMirror with the demo config to test changes.
- `node --run lint` - Run linting and formatter checks.
- `node --run lint:fix` - Fix linting and formatter issues.
- `node --run test` - Run linting and formatter checks + Run spelling check.
- `node --run test:spelling` - Run spelling check.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## Changelog

All notable changes to this project will be documented in the [CHANGELOG.md](CHANGELOG.md) file.
