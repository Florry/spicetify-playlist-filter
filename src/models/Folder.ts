import { Playlist } from "./Playlist";

export interface Folder {
    type: "folder";
    id: string;
    uid: string;
    addedAt: string;
    items: (Folder | Playlist)[];
    name: string;
    uri: string;
}