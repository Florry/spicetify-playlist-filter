import { Folder } from "../models/Folder";
import { Playlist } from "../models/Playlist";

export enum SortOption {
    Relevance = "relevance",
    NameAsc = "name-asc",
    NameDesc = "name-desc",
    Custom = "custom",
    AddedAsc = "added-asc",
    AddedDesc = "added-desc",
}

export type FilterState = {
    library: (Playlist | Folder)[];
    playlists: (Playlist | Folder)[];

    filterTerm: string;
    currentlyPlayingUri: string;
    draggingSourceUri: string;
    draggingSourceName: string;
    sortOption: SortOption;
    librarySortOption: SortOption;
    isSortingLibrary: boolean;
    openLibraryFolders: string[];
    flattenLibrary: boolean;
    isPlaying: boolean;
    renamingUri: string;

    onDraggingDropped: () => void;
    setRenamingUri: (playlistUri: string) => void;
    refreshLibrary: () => void;
}

export enum LocaleKey {
    FeedbackAddedToPlaylistGeneric = "feedback.added-to-playlist-generic",
    AddToQueue = "queue.empty-title",
    GoToPlaylistRadio = "contextmenu.go-to-playlist-radio",
    CollaborativePlaylist = "sidebar.collaborative_playlist",
    Delete = "contextmenu.delete",
    Download = "download.download",
    CreateSimilarPlaylist = "contextmenu.create-similar-playlist",
    NewFolder = "playlist.default_folder_name",
    Share = "contextmenu.share",
    CreatePlaylist = "contextmenu.create-playlist",
    RemoveFromProfile = "contextmenu.make-secret",
    EditInformation = "contextmenu.edit-details",
    Rename = "contextmenu.rename",
    DeletePlaylistModalTitle = "playlist.delete-title",
    DeletePlaylistModalDescription = "playlist.delete-description", // Detta gör att <b>{0}</b> raderas från <b>Ditt bibliotek</b>.
    DeletePlaylistModalCancel = "web-player.your-library-x.feedback-remove-from-library-dialog-cancel-button",
    Play = "play"
}