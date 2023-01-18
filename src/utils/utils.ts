import { Folder } from "../models/Folder";
import { ItemType } from "../models/Item";
import { Placeholder } from "../models/Placeholder";
import { Playlist } from "../models/Playlist";

/** Flattens library into a list of playlists */
export function flattenLibrary(library: (Folder | Playlist | Placeholder)[]): (Playlist | Folder)[] {
    const playlists: (Playlist | Folder)[] = [];

    for (const item of library) {
        if (item.type === ItemType.Folder) {
            playlists.push(...flattenLibrary(item.items));
            playlists.push(sanatizeFolder(item));
        } else if (item.type === ItemType.Playlist) {
            playlists.push(item);
        }
    }

    return playlists;
}

function sanatizeFolder(item: Folder) {
    return {
        ...item,
        items: item.items.filter((item) => item.type !== ItemType.Placeholder)
    };
}

export function getNameWithHighlightedSearchTerm(name: string, searchTerm: string) {
    if (searchTerm === "")
        return name;
    else {
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

export function sortItemsBySearchTerm(a: Playlist | Folder, b: Playlist | Folder, searchTerm: string) {
    const aMatch = a.name?.toLowerCase().indexOf(searchTerm.toLowerCase());
    const bMatch = b.name?.toLowerCase().indexOf(searchTerm.toLowerCase());

    if (aMatch > bMatch)
        return 1;
    else if (aMatch < bMatch)
        return -1;
    else
        return 0;
}
