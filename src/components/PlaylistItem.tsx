import React, { useEffect, useState } from "react";
import { getPlaylistArtwork } from "../clients/CosmosClient";
import { getConfig } from "../config/Config";
import { ConfigKey } from "../config/Config";
import { Playlist } from "../models/Playlist";
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
            role="listitem" class="main-rootlist-rootlistItem playlist-item" draggable="true"
            style={{
                ...listItemStyling,
                //  @ts-ignore
                "--indentation": indentation
            }}
            onDrop={(e) => console.log(e)}
        >
            <div aria-hidden="true" className="main-rootlist-rootlistItemOverlay"></div>
            <div
                aria-current="page"
                className="standalone-ellipsis-one-line main-rootlist-rootlistItemLink main-rootlist-rootlistItemLinkActive"
                draggable="false"
                style={mainRootlistItemRootlistItemStyling}
            >
                {getConfig(ConfigKey.UsePlaylistCovers) ? img !== "" ? <img src={img}
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
                    dangerouslySetInnerHTML={{ __html: Spicetify.SVGIcons["playlist"] }} /> : <></>}
                <a
                    aria-current="page"
                    className="standalone-ellipsis-one-line main-rootlist-rootlistItemLink playlist-filter-results-playlist-link"
                    draggable="false"
                    href={`/playlist/${playlist.uri.replace("spotify:playlist:", "")}`}
                    onClick={goToPlaylist}
                    onDoubleClick={startPlaybackFromPlaylist}
                >
                    <span
                        className="Type__TypeElement-sc-goli3j-0 gkqrGP main-rootlist-textWrapper"
                        dir="auto"
                    >
                        <span dangerouslySetInnerHTML={{ __html: getNameWithHighlightedSearchTerm(playlist.name, searchTerm) }} />
                    </span>
                </a>
            </div>
        </li>
    );
};

