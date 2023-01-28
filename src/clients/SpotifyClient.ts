import { addImageUrlByPlaylistUri } from "../data/imageUrlRepo";
import { Folder } from "../models/Folder";
import { Playlist } from "../models/Playlist";
export class SpotifyClient {

    private constructor() { }

    static loading: Map<string, boolean> = new Map();

    private static getPlaylistId(playlistUri: string) {
        return playlistUri.replace("spotify:playlist:", "");
    }

    private static getFolderId(folderUri: string) {
        return folderUri.replace("spotify:user:counterwille:folder:", "");
    }

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

    static async getUsername() {
        const response = await Spicetify.CosmosAsync.get("https://api.spotify.com/v1/me");

        return response.uri.replace("spotify:user:", "");
    }

    static async getPlaylistImages(nextUrl = "https://api.spotify.com/v1/me/playlists?limit=50"): Promise<any> {
        SpotifyClient.loading.set("getPlaylistData", true);

        const response = await Spicetify.CosmosAsync.get(nextUrl);

        if (response.items) {
            for (const item of response.items) {
                addImageUrlByPlaylistUri(item.uri, item.images);
            }
        }

        if (response.next) {
            await SpotifyClient.getPlaylistImages(response.next);
        } else {
            SpotifyClient.loading.set("getPlaylistData", false);
        }
    }

    static async addSongToPlaylist(playlistUri: string, songUri: string) {
        return await Spicetify.CosmosAsync.post(`https://api.spotify.com/v1/playlists/${SpotifyClient.getPlaylistId(playlistUri)}/tracks`, {
            uris: [songUri],
        })
    }

    static async createPlaylist(name: string, afterUri: string) {
        return await Spicetify.Platform.RootlistAPI.createPlaylist(name, {
            after: { uri: afterUri },
        })
    }

    static async createFolder(name: string, afterUri: string) {
        return await Spicetify.Platform.RootlistAPI.createFolder(name, {
            after: { uri: afterUri },
        })
    }

    static async renamePlaylist(playlistUri: string, newName: string) {
        return await Spicetify.CosmosAsync.put(`https://api.spotify.com/v1/playlists/${SpotifyClient.getPlaylistId(playlistUri)}`, {
            name: newName,
        })
    }

    static async renameFolder(folderUri: string, newName: string) {
        return await Spicetify.Platform.RootlistAPI.renameFolder(folderUri, newName);
    }


    static async deletePlaylist(playlistUri: string) {
        return await Spicetify.CosmosAsync.del(`https://api.spotify.com/v1/playlists/${SpotifyClient.getPlaylistId(playlistUri)}/followers`)
    }
}