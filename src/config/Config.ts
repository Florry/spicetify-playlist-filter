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

export const config: Record<ConfigKey, any> = {
    ...defaultConfig
};

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
};

export type SelectOptions = { label: string; value: string }[];

export type InputOptions = {
    maxLength?: number;
}

export const configItems: ConfigItem[][] = [
    [
        {
            key: "" as ConfigKey,
            label: "Keyboard shortcut",
            type: ConfigType.Title,
        },
        {
            key: ConfigKey.UseKeyboardShortcuts,
            type: ConfigType.Checkbox,
            label: "Use keyboard shortcut",
            description: "Registers a keyboard shortcut to focus the filter input field",
        },
        {
            key: ConfigKey.KeyboardShortcutKey,
            type: ConfigType.Input,
            label: "Keyboard shortcut key",
            description: "The key to use for the keyboard shortcut",
            subKey: ConfigKey.UseKeyboardShortcuts,
            options: {
                maxLength: 1
            }
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
            ]
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
            description: "Includes folders in the filter result",
        },
        {
            key: ConfigKey.OpenFoldersRecursively,
            type: ConfigType.Checkbox,
            label: "Open folders recursively",
            description: "Opens folders recursively down to any filter result when clicking on a folder in the filter result. E.g. if a folder contains a folder that doesn't match the input but it contains a playlist that does, the folder will be opened.",
            subKey: ConfigKey.IncludeFoldersInResult,
        },
        {
            key: ConfigKey.HideUnrelatedInFolders,
            type: ConfigType.Checkbox,
            label: "Hide unrelated playlists in folders",
            description: "Hides folders in folders that don't match the filter input.",
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
            type: ConfigType.Input,
            label: "Playlist list refresh interval",
            description: "The interval in milliseconds to refresh the playlist list used when filtering playlists (ms)",
        }
    ]
];