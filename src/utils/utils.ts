import { SpotifyClient } from "../clients/SpotifyClient";
import { getConfig, ConfigKey, ModifierKey } from "../config/Config";
import { LocaleKey, SortOption } from "../constants/constants";
import { getImageUrlByPlaylistUri } from "../data/imageUrlRepo";
import { Folder } from "../models/Folder";
import { Item, ItemType } from "../models/Item";
import { Placeholder } from "../models/Placeholder";
import { Playlist } from "../models/Playlist";

/** Flattens library into a list of playlists */
export function flattenLibrary(library: (Folder | Playlist | Placeholder)[]): (Playlist | Folder)[] {
    const playlists: (Playlist | Folder)[] = [];

    for (const item of library) {
        if (item.type === ItemType.Folder) {
            playlists.push(...flattenLibrary(item.items));
            playlists.push(sanitizeFolder(item));
        } else if (item.type === ItemType.Playlist) {
            playlists.push(item);
        }
    }

    return playlists;
}

export function sanitizeLibrary(library: (Folder | Playlist | Placeholder)[]) {
    const playlists: (Playlist | Folder)[] = [];

    for (const item of library) {
        if (item.type === ItemType.Folder) {
            playlists.push(sanitizeFolder(item));
        } else if (item.type === ItemType.Playlist) {
            playlists.push(item);
        }
    }

    return playlists;
}

function sanitizeFolder(item: Folder) {
    return {
        ...item,
        items: item.items.filter((item) => item.type !== ItemType.Placeholder)
    };
}

export function getNameWithHighlightedSearchTerm(name: string, searchTerm: string) {
    if (searchTerm === "")
        return name;
    else {
        // TODO: sanitize input to prevent regex crashes
        let highlightedName = name.replace(new RegExp(searchTerm, "gi"), (match: string) => {
            return `<span class="playlist-filter-results-highlight" style="background-color: rgb(255 255 255 / 8%); color: #fff;">${match}</span>`;
        });

        highlightedName = highlightedName.replace(/span> /g, "span>&nbsp;");
        highlightedName = highlightedName.replace(/ <span/g, "&nbsp;<span");
        highlightedName = highlightedName.replace(/ <\/span/g, "&nbsp;</span");

        return highlightedName;
    }
}

export function searchInFolder(folder: Folder, searchTerm: string) {
    const filteredItems = folder.items.filter(item => {
        if (item.type === ItemType.Folder) {
            return searchInFolder(item, searchTerm).items.length > 0;
        } else if (item.type === ItemType.Playlist) {
            return item.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
    }) as Playlist[];

    return {
        ...folder,
        items: filteredItems
    };
}

export function folderItemsContainsSearchTerm(folder: Folder, searchTerm: string) {
    for (const item of folder.items) {
        if (item.type === ItemType.Folder) {
            if (folderItemsContainsSearchTerm(item, searchTerm)) {
                return true;
            }
        } else if (item.type === ItemType.Playlist) {
            if (item.name?.toLowerCase().includes(searchTerm.toLowerCase())) {
                return true;
            }
        }
    }

    return false;
}

export function sortItems(a: Playlist | Folder, b: Playlist | Folder, searchTerm: string, sortOption: SortOption) {
    const lowercaseSearchTerm = searchTerm.toLowerCase();

    switch (sortOption) {
        case SortOption.Relevance:
            return sortByRelevance();
        case SortOption.NameAsc:
            return sortByName();
        case SortOption.NameDesc:
            return sortByName() * -1;
        case SortOption.Custom:
            return 0;
        case SortOption.AddedAsc:
            return sortByAddedAsc();
        case SortOption.AddedDesc:
            return sortByAddedDesc();
    }

    function sortByRelevance() {
        let aMatch = a.name?.toLowerCase().indexOf(lowercaseSearchTerm);
        let bMatch = b.name?.toLowerCase().indexOf(lowercaseSearchTerm);

        if (aMatch === -1 && bMatch === -1) {
            if (a.type === ItemType.Folder && folderItemsContainsSearchTerm(a as Folder, searchTerm)) {
                return -1;
            } else if (b.type === ItemType.Folder && folderItemsContainsSearchTerm(b as Folder, searchTerm)) {
                return 1;
            } else {
                return sortByName();
            }
        }

        /* If no match, put at the end */
        aMatch = aMatch === -1 ? 99999 : aMatch;
        bMatch = bMatch === -1 ? 99999 : bMatch;

        if (aMatch === bMatch) {
            return sortByName();
        }

        if (aMatch > bMatch)
            return 1;
        else if (aMatch < bMatch)
            return -1;
        else
            return 0;
    }

    function sortByName() {
        return a.name?.toLowerCase().localeCompare(b.name?.toLowerCase() || "") || 0;
    }

    function sortByAddedAsc() {
        const aDate = new Date(a.addedAt || 0);
        const bDate = new Date(b.addedAt || 0);

        if (aDate.getTime() === bDate.getTime()) {
            return sortByName();
        }

        if (aDate > bDate) {
            return 1;
        }
        else if (aDate < bDate) {
            return -1;
        }
        else {
            return 0;
        }
    }

    function sortByAddedDesc() {
        const aDate = new Date(a.addedAt || 0);
        const bDate = new Date(b.addedAt || 0);

        if (aDate.getTime() === bDate.getTime()) {
            return sortByName();
        }

        if (aDate > bDate) {
            return -1;
        }
        else if (aDate < bDate) {
            return 1;
        }
        else {
            return 0;
        }
    }
}

export function getConfiguredKeyboardKeys(): Spicetify.Keyboard.KeysDefine {
    const modifierKey = getConfig(ConfigKey.KeyboardShortcutModifierKey);

    return {
        key: getConfig(ConfigKey.KeyboardShortcutKey),
        ctrl: modifierKey === ModifierKey.Ctrl,
        alt: modifierKey === ModifierKey.Alt,
        meta: modifierKey === ModifierKey.Meta,
        shift: modifierKey === ModifierKey.Shift,
    };
}

export const startPlaybackFromItem = (item: Item) => Spicetify.Player.playUri(item.uri);

type OpenFoldersWithLocalStorageKey = {
    localStorageKey: string;
    openFolders: string[];
    username: string;
};

export function getOpenFolderState(returnLocalStorageKey = false): string[] | OpenFoldersWithLocalStorageKey {
    const localStorageKey = Object.keys(localStorage).find(key => key.match(/.*:expanded-folder/)) ?? "";
    const username = localStorageKey?.replace(":expanded-folder", "");
    const openFolders = JSON.parse(localStorage.getItem(localStorageKey) ?? "[]");

    if (returnLocalStorageKey) {
        return {
            localStorageKey,
            openFolders,
            username
        };
    }

    return openFolders.map((folder: string) => `spotify:user:${username}:folder:${folder}`);
}

export function setFolderOpenState(folderUri: string, open: boolean) {
    return; // TODO: needs to be more than just update localstorage
    // const { openFolders, localStorageKey, username } = getOpenFolderState(true) as OpenFoldersWithLocalStorageKey;

    // let newState: string[] = [...openFolders];

    // if (open) {
    //     newState.push(folderUri.replace(`spotify:user:${username}:folder:`, ""));
    // } else {
    //     newState.splice(openFolders.indexOf(folderUri.replace(`spotify:user:${username}:folder:`, "")), 1);
    // }

    // localStorage.setItem(localStorageKey, JSON.stringify(newState));
}

export async function getPlaylistArtwork(playlistUri: string) {
    const imagesForUri = getImageUrlByPlaylistUri(playlistUri);

    if (imagesForUri.length > 0) {
        return imagesForUri[0].url;
    }

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const imagesForUri = getImageUrlByPlaylistUri(playlistUri);

            if (imagesForUri) {
                clearInterval(interval);

                if (imagesForUri) {
                    if (imagesForUri.length) {
                        resolve(imagesForUri[0].url);
                    } else {
                        resolve("");
                    }
                }
            } else if (!SpotifyClient.loading.get("getPlaylistData")) {
                SpotifyClient.getPlaylistImages();
            }
        }, 100);
    });
}

// TODO: Only runs when react updates
export function currentPageIsPlaylist(playlistUri: string) {
    // return Spicetify.Platform.History.location.pathname === "/playlist/" + playlistUri.replace("spotify:playlist:", "");
    return false;
}

// TODO: Only runs when react updates
export function currentPageIsFolder(folderUri: string) {
    // return Spicetify.Platform.History.location.pathname === "/folder/" + folderUri.replace("spotify:folder:", "");
    return false;
}

export function getLocale(key: LocaleKey) {
    return Spicetify.Locale._dictionary[key];
}