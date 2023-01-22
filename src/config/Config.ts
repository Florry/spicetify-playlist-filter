import { SortOption } from "../constants/constants";

export enum ConfigKey {
    UseKeyboardShortcuts = "useKeyboardShortcuts",
    KeyboardShortcutKey = "keyboardShortcutKey",
    KeyboardShortcutModifierKey = "keyboardShortcutModifierKey",
    UsePlaylistCovers = "usePlaylistCovers",
    IncludeFoldersInResult = "includeFoldersInResult",
    HideUnrelatedInFolders = "hideUnrelatedInFolders",
    OpenFoldersRecursively = "openFoldersRecursively",
    PlaylistListRefreshInterval = "playlistListRefreshInterval",
    DefaultSorting = "defaultSorting",
    DebounceDefaultSorting = "debounceDefaultSorting",
    SortingDebounceTime = "sortingDebounceTime",
    SyncOpeningFoldersBetweenSorting = "syncOpeningFoldersBetweenSorting", // TODO: Implement
    KeepOpenFoldersFromCustomOpen = "keepOpenFoldersFromCustomOpen",
    FlattenLibraryWhenSortingOtherThanCustom = "flattenLibraryWhenSortingOtherThanCustom",
}

export const defaultConfig = {
    [ConfigKey.UseKeyboardShortcuts]: true,
    [ConfigKey.KeyboardShortcutKey]: "f",
    [ConfigKey.KeyboardShortcutModifierKey]: "",
    [ConfigKey.UsePlaylistCovers]: false,
    [ConfigKey.IncludeFoldersInResult]: true,
    [ConfigKey.OpenFoldersRecursively]: true,
    [ConfigKey.HideUnrelatedInFolders]: false,
    [ConfigKey.PlaylistListRefreshInterval]: 1000 * 30 * 60,
    [ConfigKey.DefaultSorting]: SortOption.Relevance,
    [ConfigKey.DebounceDefaultSorting]: true,
    [ConfigKey.SortingDebounceTime]: 7000,
    [ConfigKey.SyncOpeningFoldersBetweenSorting]: true,
    [ConfigKey.KeepOpenFoldersFromCustomOpen]: true,
    [ConfigKey.FlattenLibraryWhenSortingOtherThanCustom]: false,
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
    subKeyOf?: ConfigKey;
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
            subKeyOf: ConfigKey.UseKeyboardShortcuts,
            options: {
                maxLength: 1
            },
            onValueChange: onKeyboardConfigChange,
        },
        {
            key: ConfigKey.KeyboardShortcutModifierKey,
            type: ConfigType.Select,
            label: "Keyboard shortcut modifier key",
            subKeyOf: ConfigKey.UseKeyboardShortcuts,
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
            subKeyOf: ConfigKey.IncludeFoldersInResult,
        },
        {
            key: ConfigKey.HideUnrelatedInFolders,
            type: ConfigType.Checkbox,
            label: "Hide unrelated playlists in folders",
            description: "Hides playlists and folders in folders that don't match the filter input",
            subKeyOf: ConfigKey.IncludeFoldersInResult,
        }
    ],
    [
        {
            key: "" as ConfigKey,
            label: "Sorting",
            type: ConfigType.Title,
        },
        {
            key: ConfigKey.KeepOpenFoldersFromCustomOpen,
            type: ConfigType.Checkbox,
            label: "Keep open folders from \"custom\" open",
            description: "Keeps folders from \"custom\" sorting open when sorting by name without filtering",
        },
        {
            key: ConfigKey.FlattenLibraryWhenSortingOtherThanCustom,
            type: ConfigType.Checkbox,
            label: "Flatten library when sorting other than \"custom\"",
            description: "Flattens the library when sorting without filtering, resulting in a list of all playlists within all folders. Note: Spotify will need to reload upon closing the modal when changing this setting.",
            onValueChange: () => true,
        },
        {
            key: ConfigKey.DefaultSorting,
            type: ConfigType.Select,
            label: "Default sorting when filtering",
            options: [
                { label: "By relevance", value: SortOption.Relevance },
                { label: "By name (A-Z)", value: SortOption.NameAsc },
                { label: "By name (Z-A)", value: SortOption.NameDesc },
            ]
        },
        {
            key: ConfigKey.DebounceDefaultSorting,
            type: ConfigType.Checkbox,
            label: "Debounce reset to default sorting when filtering",
            description: "Debounces resetting the sorting to the default sorting when the filter input is cleared by removing all characters. Good for if you want to clear the filter input and then type a new filter without the sorting resetting in between, but still have the sorting reset back when done filtering. Pressing escape, the clear button or clicking outside the filter input when empty will reset right away",
        },
        {
            key: ConfigKey.SortingDebounceTime,
            type: ConfigType.Input,
            label: "Debounce time",
            description: "The time to debounce in milliseconds",
            subKeyOf: ConfigKey.DebounceDefaultSorting,
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