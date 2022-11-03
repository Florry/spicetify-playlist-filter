import React from "react";
import { Playlist } from "../models/Playlist";
import { getNameWithHighlightedSearchTerm } from "../utils/utils";
import { listItemStyling, mainRootlistItemRootlistItemStyling } from "./styling/PlaylistItemStyling";

interface Props {
    playlist: Playlist;
    searchTerm: string;
    indentation?: number;
}

export const PlaylistItem = ({ playlist, searchTerm, indentation = -2 }: Props) => {
    const goToPlaylist = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();

        const href = Spicetify.URI.from(playlist.uri)?.toURLPath(true)

        if (href) {
            Spicetify.Platform.History.push(href);
        }
    };

    const startPlaybackFromPlaylist = () => {
        alert("TODO");
    };

    return (
        <li
            className="GlueDropTarget GlueDropTarget--albums GlueDropTarget--tracks GlueDropTarget--local-tracks GlueDropTarget--episodes GlueDropTarget--playlists GlueDropTarget--folders playlist-filter-results-list-item"
            style={{
                ...listItemStyling,
                //  @ts-ignore
                "--indentation": indentation
            }}
        >
            <div
                className="main-rootlist-rootlistItem playlist-item playlist-filter-results-playlist-item"
                draggable="true"
                aria-expanded="false"
                style={mainRootlistItemRootlistItemStyling}
            >
                <a
                    aria-current="page"
                    className="standalone-ellipsis-one-line main-rootlist-rootlistItemLink playlist-filter-results-playlist-link"
                    draggable="false"
                    href={`/playlist/${playlist.uri.replace("spotify:playlist:", "")}`}
                    onClick={goToPlaylist}
                    onDoubleClick={startPlaybackFromPlaylist}
                >
                    <span
                        className="Type__TypeElement-goli3j-0 gJFKvJ main-rootlist-textWrapper playlist-filter-results-playlist-name"
                        dir="auto"
                    >
                        <span dangerouslySetInnerHTML={{ __html: getNameWithHighlightedSearchTerm(playlist.name, searchTerm) }} />
                    </span>
                </a>
            </div>
        </li>
    );
};

