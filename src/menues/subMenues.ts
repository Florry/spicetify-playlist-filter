import { openConfigModal } from "../components/config/ConfigModal";
import { getConfig, toggleConfig, ConfigKey } from "../config/Config";

export function registerSubMenues() {
    const toggleKeyboardShortcuts = new Spicetify.Menu.Item(
        "Use keyboard shortcut (f)",
        getConfig(ConfigKey.UseKeyboardShortcuts),
        (menuItem) => {
            toggleConfig(ConfigKey.UseKeyboardShortcuts);
            menuItem.isEnabled = getConfig(ConfigKey.UseKeyboardShortcuts);
        });

    // new Spicetify.Menu.SubMenu("Playlist filter", [toggleKeyboardShortcuts]).register();
    new Spicetify.Menu.Item("Playlist filter", false, openConfigModal).register();
}