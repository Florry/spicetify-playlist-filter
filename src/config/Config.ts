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
    UseSorting = "useSorting",
    UseSortingForFilteringOnly = "useSortingForFilteringOnly",
    UseFlattenLibrary = "useFlattenLibrary",
    UseFlattenLibraryForFilteringOnly = "useFlattenLibraryForFilteringOnly",
    HideFilteringWhenNotInUse = "hideFilteringWhenNotInUse",
}

export const defaultConfig = {
    [ConfigKey.UseKeyboardShortcuts]: true,
    [ConfigKey.KeyboardShortcutKey]: "f",
    [ConfigKey.KeyboardShortcutModifierKey]: "",
    [ConfigKey.UsePlaylistCovers]: false,
    [ConfigKey.IncludeFoldersInResult]: true,
    [ConfigKey.OpenFoldersRecursively]: true,
    [ConfigKey.HideUnrelatedInFolders]: false,
    [ConfigKey.PlaylistListRefreshInterval]: 1000 * 60 * 30,
    [ConfigKey.DefaultSorting]: SortOption.Relevance,
    [ConfigKey.DebounceDefaultSorting]: true,
    [ConfigKey.SortingDebounceTime]: 7000,
    [ConfigKey.SyncOpeningFoldersBetweenSorting]: true,
    [ConfigKey.KeepOpenFoldersFromCustomOpen]: true,
    [ConfigKey.FlattenLibraryWhenSortingOtherThanCustom]: false,
    [ConfigKey.UseSorting]: true,
    [ConfigKey.UseSortingForFilteringOnly]: false,
    [ConfigKey.UseFlattenLibrary]: true,
    [ConfigKey.UseFlattenLibraryForFilteringOnly]: false,
    [ConfigKey.HideFilteringWhenNotInUse]: false,
};

const _config: Record<ConfigKey, any> = {
    ...defaultConfig
};

export function getConfigObject() {
    return { ..._config };
}

export function resetConfigToDefault() {
    for (const key in defaultConfig) {
        const k = key as ConfigKey;
        _config[k] = defaultConfig[k];
        localStorage.removeItem(`playlistfilter:${k}`);
    }
}

for (const key in _config) {
    const localStorageConfig = localStorage.getItem(`playlistfilter:${key}`);
    const k = key as ConfigKey;

    if (localStorageConfig !== null) {
        if (typeof _config[k] === "boolean") {
            _config[k] = localStorageConfig === "true";
        }
        else if (typeof _config[k] === "number") {
            _config[k] = Number.parseInt(localStorageConfig);
        }
        else if (typeof _config[k] === "string") {
            _config[k] = localStorageConfig;
        }
    }
}

export function getConfig(key: ConfigKey) {
    return _config[key];
}

export function toggleConfig(key: ConfigKey) {
    _config[key] = !_config[key];
    localStorage.setItem(`playlistfilter:${key}`, _config[key] ? "true" : "false");
}

export function setConfig(key: ConfigKey, value: any) {
    _config[key] = value;
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
    Toggle = "toggle",
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
            label: "Features",
            description: "Toggle features on or off",
            type: ConfigType.Title,
        },
        {
            key: ConfigKey.UseSorting,
            label: "Sorting",
            description: "Allows you to sort your library or filtering results",
            type: ConfigType.Toggle,
        },
        {
            key: ConfigKey.UseSortingForFilteringOnly,
            label: "Sorting for filtering only",
            description: "Hides sorting when not filtering",
            type: ConfigType.Toggle,
            subKeyOf: ConfigKey.UseSorting,
        },
        {
            key: ConfigKey.UseFlattenLibrary,
            label: "Flatten library",
            description: "Allows you to flatten the whole library or filtering results to a single list",
            type: ConfigType.Toggle,
        },
        {
            key: ConfigKey.UseFlattenLibraryForFilteringOnly,
            label: "Flatten library for filtering only",
            description: "Hides flatten library when not filtering",
            type: ConfigType.Toggle,
            subKeyOf: ConfigKey.UseFlattenLibrary,
        },
        {
            key: ConfigKey.UsePlaylistCovers,
            label: "Playlist covers",
            description: "Show playlist covers in the playlist list",
            type: ConfigType.Toggle,
        }
    ],
    [
        {
            key: "" as ConfigKey,
            label: "Keyboard shortcut",
            description: "Note: Spotify will need to reload upon closing the modal when changing the keyboard shortcut configs",
            type: ConfigType.Title,
        },
        {
            key: ConfigKey.UseKeyboardShortcuts,
            type: ConfigType.Toggle,
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
        {
            key: ConfigKey.HideFilteringWhenNotInUse,
            label: "Hide filtering when not in use",
            description: "Only show the filtering input when you press the keyboard shortcut",
            type: ConfigType.Toggle,
            subKeyOf: ConfigKey.UseKeyboardShortcuts,
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
            type: ConfigType.Toggle,
            label: "Include folders in result",
            description: "Includes folders that can be navigated in the filter result",
        },
        {
            key: ConfigKey.OpenFoldersRecursively,
            type: ConfigType.Toggle,
            label: "Open folders recursively",
            description: "Opens folders recursively down to any playlist that matches the filter input when clicking on a folder in the filter result. E.g. if a folder contains a folder that doesn't match the input but it contains a playlist that does, the folder will be opened",
            subKeyOf: ConfigKey.IncludeFoldersInResult,
        },
        {
            key: ConfigKey.HideUnrelatedInFolders,
            type: ConfigType.Toggle,
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
            type: ConfigType.Toggle,
            label: "Keep open folders from \"custom\" open",
            description: "Keeps folders from \"custom\" sorting open when sorting by name without filtering",
        },
        // {
        //     key: ConfigKey.FlattenLibraryWhenSortingOtherThanCustom,
        //     type: ConfigType.Checkbox,
        //     label: "Flatten library when sorting other than \"custom\"",
        //     description: "Flattens the library when sorting without filtering, resulting in a list of all playlists within all folders. Note: Spotify will need to reload upon closing the modal when changing this setting.",
        //     onValueChange: () => true,
        // },
        {
            key: ConfigKey.DefaultSorting,
            type: ConfigType.Select,
            label: "Default sorting when filtering",
            options: [
                { label: "By relevance", value: SortOption.Relevance },
                { label: "Custom", value: SortOption.Custom },
                { label: "By name (A-Z)", value: SortOption.NameAsc },
                { label: "By name (Z-A)", value: SortOption.NameDesc },
                { label: "By date (oldest)", value: SortOption.AddedAsc },
                { label: "By date (newest)", value: SortOption.AddedDesc },
            ]
        },
        {
            key: ConfigKey.DebounceDefaultSorting,
            type: ConfigType.Toggle,
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
        // {
        //     key: ConfigKey.UsePlaylistCovers,
        //     type: ConfigType.Toggle,
        //     label: "Use playlist covers",
        //     description: "Adds playlist cover images to the left of the playlist name in the filter result",
        // },
        {
            key: ConfigKey.PlaylistListRefreshInterval,
            type: ConfigType.Select,
            label: "Playlist list refresh interval",
            description: "How often the playlist list is fetched when not in use. Note that the library is fetched once when spotify launches and is refetched when filtering begins or if sorting is changed to keep up with changes. This is purely to limit popin when filtering and sorting and can safely be disabled",
            options: [
                { label: "Disabled", value: "-1" },
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