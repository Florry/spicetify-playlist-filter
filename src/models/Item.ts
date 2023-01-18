export enum ItemType {
    Folder = "folder",
    Playlist = "playlist",
    Placeholder = "placeholder",
}

export type Item = {
    id: string;
    uri: string;
    addedAt: string;
    type: ItemType;
}