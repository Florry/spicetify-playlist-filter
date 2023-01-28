import { openConfigModal } from "../components/config/ConfigModal";

export function registerSubMenues() {
    new Spicetify.Menu.Item("Playlist filter", false, openConfigModal).register();
}