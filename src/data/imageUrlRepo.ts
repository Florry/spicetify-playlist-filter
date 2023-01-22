import { Image } from "../models/Image";

// In memory image repository
export const imagesByPlaylistUri: { [playlistUri: string]: Image[] } = {};

export function getImageUrlByPlaylistUri(playlistUri: string) {
    if (imagesByPlaylistUri[playlistUri]) {
        return imagesByPlaylistUri[playlistUri];
    } else {
        return [];
    }
}

export function addImageUrlByPlaylistUri(playlistUri: string, images: Image[]) {
    imagesByPlaylistUri[playlistUri] = images;
}