import { Folder } from "../models/Folder";
import { Placeholder } from "../models/Placeholder";
import { Playlist } from "../models/Playlist";

/** Flattens library into a list of playlists */
export function flattenLibrary(library: (Folder | Playlist|Placeholder)[]): Playlist[] {
    const playlists: Playlist[] = [];

    for (const item of library) {
        if (item.type === "folder") {
            playlists.push(...flattenLibrary(item.items));
        } else if(item.type === "playlist"){
            playlists.push(item);
        }
    }

    return playlists;
}