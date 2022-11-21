import React, { useEffect, useState } from "react";
import { Playlist } from "../models/Playlist";
import { getPlaylistArtwork, imagesById } from "../clients/CosmosClient";
import { getNameWithHighlightedSearchTerm } from "../utils/utils";
import { listItemStyling, mainRootlistItemRootlistItemStyling } from "./styling/PlaylistItemStyling";

interface Props {
    playlist: Playlist;
    searchTerm: string;
    indentation?: number;
}

export const PlaylistItem = ({ playlist, searchTerm, indentation = -2 }: Props) => {
    const [img, setImg] = useState(playlist.images.length > 0 ? playlist.images[0].url : "");

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

    useEffect(() => {
        getPlaylistArtwork(playlist.uri).then((img) => setImg(img));
    }, []);

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
                {img !== "" ? <img src={img}
                    style={{
                        width: "1.5em",
                        height: "1.5em",
                        borderRadius: 2,
                        marginRight: 12,
                    }}
                /> : <svg
                    height="1.5em"
                    width="1.5em"
                    fill="currentColor"
                    style={{
                        marginRight: 12,
                        padding: 3,
                    }}
                    dangerouslySetInnerHTML={{ __html: Spicetify.SVGIcons["playlist"] }} />}
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

