import { Folder } from "../models/Folder";
import { Playlist } from "../models/Playlist";

/** Flattens library into a list of playlists */
export function flattenLibrary(library: (Folder | Playlist)[]): Playlist[] {
	const playlists: Playlist[] = [];

	for (const item of library) {
		if (item.type === "folder") {
			playlists.push(...flattenLibrary(item.items));
		} else {
			playlists.push(item);
		}
	}

	return playlists;
}