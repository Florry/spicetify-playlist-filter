import React from "react";
import { Playlist } from "../models/Playlist";
import { listItemStyling, mainRootlistItemRootlistItemStyling } from "./styling/PlaylistItemStyling";

interface Props {
    playlist: Playlist;
    searchTerm: string;
}

export const PlaylistItem = ({ playlist, searchTerm }: Props) => {
    const getNameWithHighlightedSearchTerm = () => {
        const name = playlist.name;

        if (searchTerm === "")
            return name;
        else {
            let highlightedName = name.replace(new RegExp(searchTerm, "gi"), (match) => {
                return `<span class="playlist-filter-results-highlight" style="background-color: rgb(255 255 255 / 8%); color: #fff;">${match}</span>`;
            });

            highlightedName = highlightedName.replace(/span> /g, "span>&nbsp;");
            highlightedName = highlightedName.replace(/ <span/g, "&nbsp;<span");
            highlightedName = highlightedName.replace(/ <\/span/g, "&nbsp;</span");

            return highlightedName;
        }
    }

    const goToPlaylist = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();

        Spicetify.Platform.History.push({
            pathname: `/playlist/${playlist.uri.replace("spotify:playlist:", "")}`,
            search: "",
            hash: "",
            state: {
                referrer: "home",
                navigationalRoot: "home"
            },
            key: "bm6fp4"
        });
    };

    return (
        <li
            className="GlueDropTarget GlueDropTarget--albums GlueDropTarget--tracks GlueDropTarget--local-tracks GlueDropTarget--episodes GlueDropTarget--playlists GlueDropTarget--folders playlist-filter-results-list-item"
            style={listItemStyling}
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
                >
                    <span
                        className="Type__TypeElement-goli3j-0 gJFKvJ main-rootlist-textWrapper playlist-filter-results-playlist-name"
                        dir="auto"
                    >
                        <span dangerouslySetInnerHTML={{ __html: getNameWithHighlightedSearchTerm() }} />
                    </span>
                </a>
            </div>
        </li>
    );
};

