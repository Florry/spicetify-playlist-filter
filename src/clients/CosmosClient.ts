const GET_PLAYLISTS_URL = "https://api.spotify.com/v1/me/playlists?limit=50";

export const imagesById: any = {};

export default async function getPlaylistData(url: string = GET_PLAYLISTS_URL): Promise<any> {
    const response = await Spicetify.CosmosAsync.get(url);

    if (response.items) {
        for (const item of response.items) {
            imagesById[item.uri] = item.images;
        }
    }

    if (response.next) {
        await getPlaylistData(response.next);
    }
}

export async function getPlaylistArtwork(playlistId: string) {
    if (imagesById[playlistId] && imagesById[playlistId].length > 0) {
        return imagesById[playlistId][0].url;
    }

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            if (imagesById[playlistId]) {
                clearInterval(interval);
                if (imagesById[playlistId]) {
                    if (imagesById[playlistId].length) {
                        resolve(imagesById[playlistId][0].url);
                    } else {
                        resolve("");
                    }
                }
            }
        }, 100);
    });
}
