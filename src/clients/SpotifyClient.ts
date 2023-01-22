import { addImageUrlByPlaylistUri } from "../data/imageUrlRepo";
import { Folder } from "../models/Folder";
import { Playlist } from "../models/Playlist";
export class SpotifyClient {

    private constructor() { }

    static loading: Map<string, boolean> = new Map();

    static async getLibrary(): Promise<(Folder | Playlist)[]> {
        const res = await Spicetify.Platform.RootlistAPI.getContents({ metadata: 1, policy: { picture: true } });

        return res.items;
    }

    static async getSongFromAlbum(albumUri: string, songName: string) {
        const res = await SpotifyClient.getAlbum(albumUri);

        for (const song of res.items) {
            if (song.name === songName) {
                return song.uri;
            }
        }
    }

    static async getAlbum(albumUri: string) {
        return await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/albums/${albumUri}/tracks`);
    }

    static async getUsernameUri() {
        const response = await Spicetify.CosmosAsync.get("https://api.spotify.com/v1/me");
        return response.uri;
    }

    static async getPlaylistData(nextUrl = "https://api.spotify.com/v1/me/playlists?limit=50"): Promise<any> {
        SpotifyClient.loading.set("getPlaylistData", true);

        const response = await Spicetify.CosmosAsync.get(nextUrl);

        if (response.items) {
            for (const item of response.items) {
                addImageUrlByPlaylistUri(item.uri, item.images);
            }
        }

        if (response.next) {
            await SpotifyClient.getPlaylistData(response.next);
        } else {
            SpotifyClient.loading.set("getPlaylistData", false);
        }
    }
}