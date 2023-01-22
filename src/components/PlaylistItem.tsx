import React, { useEffect, useState } from "react";
import { ConfigKey, getConfig } from "../config/Config";
import { useFilterContext } from "../context/context";
import { Playlist } from "../models/Playlist";
import { currentPageIsPlaylist, getNameWithHighlightedSearchTerm, getPlaylistArtwork, startPlaybackFromItem } from "../utils/utils";
import NowPlayingIndicator from "./NowPlayingIndicator";
import { listItemStyling, mainRootlistItemRootlistItemStyling } from "./styling/PlaylistItemStyling";

interface Props {
    playlist: Playlist;
    searchTerm: string;
    indentation?: number;
}

export const PlaylistItem = ({ playlist, searchTerm, indentation = -2 }: Props) => {
    const { currentlyPlayingUri } = useFilterContext();
    const [img, setImg] = useState<string>(playlist.images.length > 0 ? playlist.images[0].url : "");

    const goToPlaylist = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();

        const href = Spicetify.URI.from(playlist.uri)?.toURLPath(true)

        if (href) {
            Spicetify.Platform.History.push(href);
        }
    };
    useEffect(() => {
        if (getConfig(ConfigKey.UsePlaylistCovers)) {
            getPlaylistArtwork(playlist.uri).then((img) => setImg(img as string));
        }
    }, []);

    const playlistRef = React.useRef<HTMLAnchorElement>(null);

    return (
        <>
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
                    className="standalone-ellipsis-one-line main-rootlist-rootlistItemLink"
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
                        className={`standalone-ellipsis-one-line main-rootlist-rootlistItemLink playlist-filter-results-playlist-link ${currentPageIsPlaylist(playlist.uri) ? "main-rootlist-rootlistItemLinkActive" : ""}`}
                        draggable="false"
                        href={`/playlist/${playlist.uri.replace("spotify:playlist:", "")}`}
                        onClick={goToPlaylist}
                        onDoubleClick={() => startPlaybackFromItem(playlist)}
                        ref={playlistRef}
                    >
                        <span
                            className="Type__TypeElement-sc-goli3j-0 gkqrGP main-rootlist-textWrapper"
                            dir="auto"
                        >
                            <span dangerouslySetInnerHTML={{ __html: getNameWithHighlightedSearchTerm(playlist.name, searchTerm) }} />
                        </span>
                    </a>
                    {currentlyPlayingUri === playlist.uri && <NowPlayingIndicator />}
                </div>
            </li>
        </>
    );
};

