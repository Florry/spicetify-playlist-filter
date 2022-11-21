import { Item } from "./Item";
import { Placeholder } from "./Placeholder";
import { Playlist } from "./Playlist";

export interface Folder {
    type: Item.Folder;
    id: string;
    uid: string;
    addedAt: string;
    items: (Folder | Playlist | Placeholder)[];
    name: string;
    uri: string;
}