import { Image } from "./Image";
import { Owner } from "./Owner";
import { Collaborator } from "./Collaborator";
import { Item, ItemType } from "./Item";

export interface Playlist extends Item {
    type: ItemType.Playlist;
    name: string;
    description: string;
    images: Image[];
    madeFor: null;
    owner: Owner;
    totalLength: number;
    totalLikes: null;
    duration: null;
    isCollaborative: boolean;
    isOwnedBySelf: boolean;
    isPublished: boolean;
    hasEpisodes: null;
    hasSpotifyTracks: null;
    canAdd: boolean;
    canRemove: boolean;
    canPlay: null;
    formatListData: null;
    canReportAnnotationAbuse: boolean;
    hasDateAdded: boolean;
    permissions: null;
    collaborators: Collaborator;
}

export function isPlaylist(x: Item): x is Playlist {
    return x.type === ItemType.Playlist;
}
