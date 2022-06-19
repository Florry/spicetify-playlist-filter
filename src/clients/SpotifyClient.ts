import { Folder } from "../models/Folder";
import { Playlist } from "../models/Playlist";

export class SpotifyClient {

    private constructor() { }

    static async getLibrary(): Promise<(Folder | Playlist)[]> {
        const res = await Spicetify.Platform.RootlistAPI.getContents({ metadata: 1, policy: { picture: true } });

        return res.items;
    }

}