import { USE_KEYBOARD_SHORTCUTS } from "../constants/constants";

export const config: Record<string, any> = {
    [USE_KEYBOARD_SHORTCUTS]: true
};

for (const key in config) {
    if (localStorage.getItem(`playlistfilter:${key}`) !== null)
        config[key] = localStorage.getItem(`playlistfilter:${key}`) === "true";
}

export function getConfig(key: string) {
    return config[key];
}

export function toggleConfig(key: string) {
    config[key] = !config[key];
    localStorage.setItem(`playlistfilter:${key}`, config[key] ? "true" : "false");
}