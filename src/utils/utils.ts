import { Folder } from "../models/Folder";
import { Placeholder } from "../models/Placeholder";
import { Playlist } from "../models/Playlist";

/** Flattens library into a list of playlists */
export function flattenLibrary(library: (Folder | Playlist | Placeholder)[]): (Playlist | Folder)[] {
    const playlists: (Playlist | Folder)[] = [];

    for (const item of library) {
        if (item.type === "folder") {
            playlists.push(...flattenLibrary(item.items));
        } else if(item.type === "playlist"){
            playlists.push(item);
        }
    }

    return playlists;
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