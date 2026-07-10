import Gio from 'gi://Gio';
import Adw from 'gi://Adw';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class AutoTyperPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        
        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'dialog-information-symbolic',
        });

        const group = new Adw.PreferencesGroup({
            title: 'Timing Configuration',
            description: 'Tune the injection timings for your system performance.',
        });
        page.add(group);

        const delayRow = new Adw.SpinRow({
            title: 'Clipboard Restore Delay (ms)',
            subtitle: 'Time to wait before restoring original clipboard contents. Increase this if target apps paste the wrong text on slow machines.',
            adjustment: new Adw.Adjustment({
                lower: 50,
                upper: 5000,
                step_increment: 50,
                page_increment: 200,
            }),
        });

        settings.bind(
            'restore-delay-ms',
            delayRow,
            'value',
            Gio.SettingsBindFlags.DEFAULT
        );

        group.add(delayRow);
        window.add(page);
    }
}
