import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import Gio from 'gi://Gio';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

function _logError(msg) {
    console.error(`AutoTyper: ${msg}`);
}

const DBUS_SCHEMA = `
<node>
  <interface name="org.gnome.Shell.Extensions.AutoTyper">
    <method name="TypeText">
      <arg type="s" direction="in" name="token"/>
      <arg type="s" direction="in" name="text"/>
    </method>
  </interface>
</node>`;

export default class AutoTyperExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._token = GLib.uuid_string_random();
        let runtimeDir = GLib.getenv('XDG_RUNTIME_DIR') || '/tmp';
        this._tokenPath = runtimeDir + '/autotyper.token';
        this._timeoutId = 0;
        
        try {
            let file = Gio.File.new_for_path(this._tokenPath);
            let encoder = new TextEncoder();
            file.replace_contents(encoder.encode(this._token), null, false, Gio.FileCreateFlags.PRIVATE, null);
        } catch (e) {
            _logError(`Failed to write token file: ${e.message}`);
        }

        this._dbusImpl = Gio.DBusExportedObject.wrapJSObject(DBUS_SCHEMA, this);
        this._dbusImpl.export(Gio.DBus.session, '/org/gnome/Shell/Extensions/AutoTyper');
        
        try {
            let seat = global.stage.context.get_backend().get_default_seat();
            this._virtualDevice = seat.create_virtual_device(Clutter.InputDeviceType.KEYBOARD_DEVICE);
        } catch (e) {
            _logError(`Failed to create virtual keyboard device: ${e.message}`);
        }
    }

    disable() {
        this._settings = null;
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = 0;
        }
        if (this._tokenPath) {
            try {
                let file = Gio.File.new_for_path(this._tokenPath);
                if (file.query_exists(null)) {
                    file.delete(null);
                }
            } catch (e) {
                _logError(`Failed to delete token file: ${e.message}`);
            }
            this._tokenPath = null;
        }

        if (this._dbusImpl) {
            this._dbusImpl.unexport();
            this._dbusImpl = null;
        }
        if (this._virtualDevice) {
            this._virtualDevice = null;
        }
    }

    TypeText(token, text) {
        if (token !== this._token) {
            _logError("Unauthorized access attempt with invalid token.");
            return;
        }

        // 1. Try native inputMethod if focus is active
        if (Main.inputMethod && Main.inputMethod.currentFocus) {
            try {
                Main.inputMethod.commit(text);
                return;
            } catch (e) {
                _logError(`Main.inputMethod.commit failed: ${e.message}`);
            }
        }
        
        // 2. Fallback to clipboard injection + virtual Ctrl+V
        if (this._virtualDevice) {
            try {
                let clipboard = St.Clipboard.get_default();
                
                // Retrieve current clipboard content to restore it later
                clipboard.get_text(St.ClipboardType.CLIPBOARD, (clip, currentText) => {
                    // Set our text to paste
                    clipboard.set_text(St.ClipboardType.CLIPBOARD, text);
                    
                    // Trigger paste
                    let time = Clutter.get_current_event_time();
                    if (time === 0) time = Date.now();
                    
                    this._virtualDevice.notify_keyval(time * 1000, Clutter.KEY_Control_L, Clutter.KeyState.PRESSED);
                    this._virtualDevice.notify_keyval(time * 1000, Clutter.KEY_v, Clutter.KeyState.PRESSED);
                    this._virtualDevice.notify_keyval(time * 1000, Clutter.KEY_v, Clutter.KeyState.RELEASED);
                    this._virtualDevice.notify_keyval(time * 1000, Clutter.KEY_Control_L, Clutter.KeyState.RELEASED);
                    
                    // Retrieve configured delay
                    let delay = 150;
                    if (this._settings) {
                        delay = this._settings.get_int('restore-delay-ms');
                    }

                    if (this._timeoutId) {
                        GLib.Source.remove(this._timeoutId);
                        this._timeoutId = 0;
                    }

                    // Restore original clipboard after application pastes the text
                    this._timeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, delay, () => {
                        if (currentText !== null) {
                            clipboard.set_text(St.ClipboardType.CLIPBOARD, currentText);
                        } else {
                            clipboard.set_text(St.ClipboardType.CLIPBOARD, "");
                        }
                        this._timeoutId = 0;
                        return GLib.SOURCE_REMOVE;
                    });
                });
            } catch (e) {
                _logError(`Clipboard + Ctrl+V fallback failed: ${e.message}`);
            }
        } else {
            _logError("No virtual device available for fallback paste.");
        }
    }
}
