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

export function getSmallestImageByPlaylistUri(playlistUri: string) {
    if (imagesByPlaylistUri[playlistUri]) {
        const images = getImageUrlByPlaylistUri(playlistUri);

        if (images.length === 0) {
            return "";
        }

        let smallestImage = images[0];

        for (const image of images) {
            if (image.width < smallestImage.width) {
                smallestImage = image;
            }
        }

        return smallestImage.url;
    } else {
        return undefined;
    }
}