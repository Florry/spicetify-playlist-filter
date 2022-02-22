import { Image } from "./Image";
import { Owner } from "./Owner";
import { Collaborator } from "./Collaborator";

export interface Playlist {
	id: string;
	uid: string;
	addedAt: string;
	type: "playlist";
	uri: string;
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




