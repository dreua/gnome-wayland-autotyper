# GNOME Wayland AutoTyper ⌨️

The ultimate, secure text injection bridge for GNOME Wayland.

## Why this exists?

If you've ever tried to programmatically inject text or simulate keystrokes on Wayland, you probably know the pain:
1. Native Input Method (IME) APIs like `text-input-v3` only work reliably in native Wayland applications. They frequently fail or are completely ignored by XWayland and Electron applications (like Discord, VSCode, Slack).
2. Existing tools like `ydotool` or `wtype` work, but they use virtual input devices in a way that triggers GNOME's terrifying **"Screen Recording" indicator** (the orange/red dot on your top panel). This ruins the UX and makes users feel like they are being spied on.

**Wayland AutoTyper** solves this. It provides a native, silent D-Bus bridge that can instantly paste text into *any* active window (native, XWayland, or Electron) without triggering screen recording indicators.

## Features

- **Invisible**: No screen recording dots, no annoying indicators.
- **Universal**: Injects text via a sophisticated fallback mechanism (`clipboard + Clutter.VirtualInputDevice Ctrl+V`) to guarantee 100% compatibility across all apps.
- **Secure by Design**: Features a **Session Token Authentication** mechanism. Sandboxed applications (Flatpaks/Snaps) cannot arbitrarily call this D-Bus method without reading the secure token from the host filesystem.

## How it works

When the extension is enabled, it exposes a secure D-Bus interface:
`org.gnome.Shell.Extensions.AutoTyper.TypeText(token, text)`

A unique `autotyper.token` is generated and saved to your `XDG_RUNTIME_DIR` (e.g. `/run/user/1000/`) with strict `0600` permissions. Only host applications running under your user can read this token.

## Installation

### For Users
1. Download the latest `.zip` release.
2. Install it via the GNOME Extensions app or Extension Manager.
3. Use the provided client script (`client/autotype.sh`) to inject text instantly!

### For Developers (Build from source)
```bash
git clone https://github.com/YOUR_USERNAME/gnome-wayland-autotyper.git
cd gnome-wayland-autotyper
make zip
```
Upload the resulting `autotyper@mbxnd.com.zip` to [GNOME Extensions (EGO)](https://extensions.gnome.org).

## Usage

Simply use the provided shell script:
```bash
./client/autotype.sh "Hello World, injected natively!"
```
If you run it without arguments, it automatically injects your current clipboard content.

## License

MIT License. See `LICENSE` for more information.
