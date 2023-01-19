import React, { useEffect, useLayoutEffect, useState } from "react";
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
    const [playlistIsPlaying, setPlaylistIsPlaying] = useState(false);

    const goToPlaylist = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();

        const href = Spicetify.URI.from(playlist.uri)?.toURLPath(true)

        if (href) {
            Spicetify.Platform.History.push(href);
        }
    };

    const startPlaybackFromPlaylist = () => Spicetify.Player.playUri(playlist.uri);

    useEffect(() => {
        if (getConfig(ConfigKey.UsePlaylistCovers)) {
            getPlaylistArtwork(playlist.uri).then((img) => setImg(img));
        }

        const checkIfPlayingFromPlaylist = () => {
            const currentPlaylistUri = Spicetify.Player.data.context_uri;
            setPlaylistIsPlaying(currentPlaylistUri === playlist.uri);
        };

        // TODO: this will register two event handlers per playlist item, this can potentially add up
        Spicetify.Player.addEventListener("onplaypause", checkIfPlayingFromPlaylist);
        Spicetify.Player.addEventListener("songchange", checkIfPlayingFromPlaylist);

        checkIfPlayingFromPlaylist();

        return () => {
            Spicetify.Player.removeEventListener("onplaypause", checkIfPlayingFromPlaylist);
            Spicetify.Player.removeEventListener("songchange", checkIfPlayingFromPlaylist);
        }
    }, []);

    return (
        <li
            role="listitem" class="main-rootlist-rootlistItem playlist-item" draggable="true"
            style={{
                ...listItemStyling,
                //  @ts-ignore
                "--indentation": indentation
            }}
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
                {
                    playlistIsPlaying && (
                        <div className="main-rootlist-statusIcons">
                            <button
                                class="CCeu9OfWSwIAJqA49n84 ZcKzjCkYGeMizcSAP8UX"
                                aria-label="Now playing"
                                tabindex="0"
                                style={{
                                    // @ts-ignore
                                    "--button-size": 12
                                }}
                            >
                                <svg role="img"
                                    height="12"
                                    width="12"
                                    aria-hidden="true"
                                    viewBox="0 0 16 16"
                                    data-encore-id="icon"
                                    className="Svg-sc-ytk21e-0 uPxdw"
                                >
                                    <path d="M9.741.85a.75.75 0 01.375.65v13a.75.75 0 01-1.125.65l-6.925-4a3.642 3.642 0 01-1.33-4.967 3.639 3.639 0 011.33-1.332l6.925-4a.75.75 0 01.75 0zm-6.924 5.3a2.139 2.139 0 000 3.7l5.8 3.35V2.8l-5.8 3.35zm8.683 4.29V5.56a2.75 2.75 0 010 4.88z" />
                                    <path d="M11.5 13.614a5.752 5.752 0 000-11.228v1.55a4.252 4.252 0 010 8.127v1.55z" />
                                </svg>
                            </button>
                        </div>
                    )
                }
            </div>
        </li>
    );
};

