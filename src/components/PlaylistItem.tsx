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
                return `<span style="background-color: rgb(255 255 255 / 8%); color: #fff;">${match}</span>`;
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

// const ola = (<li role="listitem" class="main-rootlist-rootlistItem playlist-item" draggable="true" style="--indentation:1;">
//     <img class="playlist-item__img" src="https://mosaic.scdn.co/640/ab67616d0000b2733f37a380d4e0dd0399e45f04ab67616d0000b27366bf5b049e336d5b2eaab375ab67616d0000b273727c775b21608903cfca881eab67616d0000b273b0d93d82c831a2655e32762e"/>
//     <div aria-hidden="true" class="main-rootlist-rootlistItemOverlay"/>
//     <a class="standalone-ellipsis-one-line main-rootlist-rootlistItemLink" draggable="false" tabindex="-1" href="/playlist/2GvxLmUP5OpxNKNgx8uOzG">
//         <span class="Type__TypeElement-goli3j-0 gJFKvJ main-rootlist-textWrapper" dir="auto">Starred x2</span></a><div class="main-rootlist-statusIcons"></div></li>);

    return (
        <li
            className="GlueDropTarget GlueDropTarget--albums GlueDropTarget--tracks GlueDropTarget--local-tracks GlueDropTarget--episodes GlueDropTarget--playlists GlueDropTarget--folders"
            style={listItemStyling}
        >
            <div
                className="main-rootlist-rootlistItem playlist-item"
                draggable="true"
                aria-expanded="false"
                style={mainRootlistItemRootlistItemStyling}
            >
                <a
                    aria-current="page"
                    className="standalone-ellipsis-one-line main-rootlist-rootlistItemLink"
                    draggable="false"
                    href={`/playlist/${playlist.uri.replace("spotify:playlist:", "")}`}
                    onClick={goToPlaylist}
                >
                    <span
                        className="Type__TypeElement-goli3j-0 gJFKvJ main-rootlist-textWrapper"
                        dir="auto"
                    >
                        <span dangerouslySetInnerHTML={{ __html: getNameWithHighlightedSearchTerm() }} />
                    </span>
                </a>
            </div>
        </li>
    );
};

