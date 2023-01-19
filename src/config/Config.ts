export enum ConfigKey {
    UseKeyboardShortcuts = "useKeyboardShortcuts",
    KeyboardShortcutKey = "keyboardShortcutKey",
    KeyboardShortcutModifierKey = "keyboardShortcutModifierKey",
    UsePlaylistCovers = "usePlaylistCovers",
    IncludeFoldersInResult = "includeFoldersInResult",
    HideUnrelatedInFolders = "hideUnrelatedInFolders",
    OpenFoldersRecursively = "openFoldersRecursively",
    PlaylistListRefreshInterval = "playlistListRefreshInterval"
}

export const defaultConfig = {
    [ConfigKey.UseKeyboardShortcuts]: true,
    [ConfigKey.KeyboardShortcutKey]: "f",
    [ConfigKey.KeyboardShortcutModifierKey]: "",
    [ConfigKey.UsePlaylistCovers]: false,
    [ConfigKey.IncludeFoldersInResult]: true,
    [ConfigKey.OpenFoldersRecursively]: true,
    [ConfigKey.HideUnrelatedInFolders]: false,
    [ConfigKey.PlaylistListRefreshInterval]: 1000 * 30 * 60
};

const config: Record<ConfigKey, any> = {
    ...defaultConfig
};

export function getConfigObject() {
    return { ...config };
}

export function resetConfigToDefault() {
    for (const key in defaultConfig) {
        const k = key as ConfigKey;
        config[k] = defaultConfig[k];
        localStorage.removeItem(`playlistfilter:${k}`);
    }
}

for (const key in config) {
    const localStorageConfig = localStorage.getItem(`playlistfilter:${key}`);
    const k = key as ConfigKey;

    if (localStorageConfig !== null) {
        if (typeof config[k] === "boolean") {
            config[k] = localStorageConfig === "true";
        }
        else if (typeof config[k] === "number") {
            config[k] = Number.parseInt(localStorageConfig);
        }
        else if (typeof config[k] === "string") {
            config[k] = localStorageConfig;
        }
    }
}

export function getConfig(key: ConfigKey) {
    return config[key];
}

export function toggleConfig(key: ConfigKey) {
    config[key] = !config[key];
    localStorage.setItem(`playlistfilter:${key}`, config[key] ? "true" : "false");
}

export function setConfig(key: ConfigKey, value: any) {
    config[key] = value;
    localStorage.setItem(`playlistfilter:${key}`, value.toString());
}

export enum ModifierKey {
    Ctrl = "ctrl",
    Alt = "alt",
    Shift = "shift",
    Meta = "meta",
}

export enum ConfigType {
    Title = "title",
    Input = "input",
    Checkbox = "checkbox",
    Select = "select",
}

export type ConfigItem = {
    key: ConfigKey;
    type: ConfigType;
    label: string;
    description?: string;
    subKey?: ConfigKey;
    options?: SelectOptions | InputOptions;
    /** Returns whether to reload spotify after closing the config modal */
    onValueChange?: (value: any) => boolean | void;
    link?: string;
};

export type SelectOptions = { label: string; value: string }[];

export type InputOptions = {
    maxLength?: number;
}

function onKeyboardConfigChange() {
    return true;
}

export const configItems: ConfigItem[][] = [
    [
        {
            key: "" as ConfigKey,
            label: "Keyboard shortcut",
            description: "Note: Spotify will need to reload upon closing the modal when changing the keyboard shortcut configs",
            type: ConfigType.Title,
        },
        {
            key: ConfigKey.UseKeyboardShortcuts,
            type: ConfigType.Checkbox,
            label: "Use keyboard shortcut",
            description: "Registers a keyboard shortcut to focus the filter input field",
            onValueChange: onKeyboardConfigChange,
        },
        {
            key: ConfigKey.KeyboardShortcutKey,
            type: ConfigType.Input,
            label: "Keyboard shortcut key",
            description: "The key to use for the keyboard shortcut",
            subKey: ConfigKey.UseKeyboardShortcuts,
            options: {
                maxLength: 1
            },
            onValueChange: onKeyboardConfigChange,
        },
        {
            key: ConfigKey.KeyboardShortcutModifierKey,
            type: ConfigType.Select,
            label: "Keyboard shortcut modifier key",
            subKey: ConfigKey.UseKeyboardShortcuts,
            options: [
                { label: "None", value: "" },
                { label: "Ctrl", value: "ctrl" },
                { label: "Shift", value: "shift" },
                { label: "Alt", value: "alt" },
                { label: "Cmd", value: "meta" }
            ],
            onValueChange: onKeyboardConfigChange,
        },
    ],
    [
        {
            key: "" as ConfigKey,
            label: "Folders in filter result",
            type: ConfigType.Title,
        },
        {
            key: ConfigKey.IncludeFoldersInResult,
            type: ConfigType.Checkbox,
            label: "Include folders in result",
            description: "Includes folders that can be navigated in the filter result",
        },
        {
            key: ConfigKey.OpenFoldersRecursively,
            type: ConfigType.Checkbox,
            label: "Open folders recursively",
            description: "Opens folders recursively down to any playlist that matches the filter input when clicking on a folder in the filter result. E.g. if a folder contains a folder that doesn't match the input but it contains a playlist that does, the folder will be opened",
            subKey: ConfigKey.IncludeFoldersInResult,
        },
        {
            key: ConfigKey.HideUnrelatedInFolders,
            type: ConfigType.Checkbox,
            label: "Hide unrelated playlists in folders",
            description: "Hides playlists and folders in folders that don't match the filter input",
            subKey: ConfigKey.IncludeFoldersInResult,
        }
    ],
    [
        {
            key: "" as ConfigKey,
            label: "Miscellaneous",
            type: ConfigType.Title,
        },
        {
            key: ConfigKey.UsePlaylistCovers,
            type: ConfigType.Checkbox,
            label: "Use album covers",
            description: "Adds playlist cover images to the left of the playlist name in the filter result",
        },
        {
            key: ConfigKey.PlaylistListRefreshInterval,
            type: ConfigType.Select,
            label: "Playlist list refresh interval",
            description: "The interval in milliseconds to refresh the playlist list used when filtering playlists. It will also fetch once when spotify is launched so unless you create or add a lot of playlist this can be a relatively high number",
            options: [
                { label: "1 minute", value: "60000" },
                { label: "5 minutes", value: "300000" },
                { label: "10 minutes", value: "600000" },
                { label: "30 minutes", value: "1800000" },
                { label: "1 hour", value: "3600000" },
                { label: "2 hours", value: "7200000" },
                { label: "6 hours", value: "21600000" },
                { label: "12 hours", value: "43200000" },
                { label: "1 day", value: "86400000" },
            ],
        },

    ]
];