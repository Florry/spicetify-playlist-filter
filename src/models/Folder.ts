import { Item, ItemType } from "./Item";
import { Placeholder } from "./Placeholder";
import { Playlist } from "./Playlist";

export interface Folder extends Item {
    type: ItemType.Folder;
    items: (Folder | Playlist | Placeholder)[];
    name: string;
    uri: string;
}

export function isFolder(x: Item): x is Folder {
    return x.type === ItemType.Folder;
}