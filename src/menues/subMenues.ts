import { getConfig, toggleConfig } from "../config/Config";
import { USE_KEYBOARD_SHORTCUTS } from "../constants/constants";

export function registerSubMenues() {
	const toggleKeyboardShortcuts = new Spicetify.Menu.Item("Use keyboard shortcut (f)",
		getConfig(USE_KEYBOARD_SHORTCUTS),
		(menuItem) => {
			toggleConfig(USE_KEYBOARD_SHORTCUTS);
			menuItem.isEnabled = getConfig(USE_KEYBOARD_SHORTCUTS);
		});

	new Spicetify.Menu.SubMenu("Playlist filter", [toggleKeyboardShortcuts]).register();
}