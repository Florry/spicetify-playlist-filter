import React, { useEffect, useMemo, useRef, useState } from "react";
import CollaborativeIcon from "../assets/icons/CollaborativeIcon";
import { SpotifyClient } from "../clients/SpotifyClient";
import { ConfigKey, getConfig } from "../config/Config";
import { LocaleKey } from "../constants/constants";
import { useConfigContext, useFilterContext } from "../context/context";
import { Playlist } from "../models/Playlist";
import { currentPageIsPlaylist, getNameWithHighlightedSearchTerm, getPlaylistArtwork, startPlaybackFromItem } from "../utils/utils";
import NowPlayingIndicator from "./NowPlayingIndicator";
import RightClickMenu from "./RightClickMenu";
import { listItemStyling, mainRootlistItemRootlistItemStyling } from "./styling/PlaylistItemStyling";

// TODO: Use ListItem component

interface Props {
    playlist: Playlist;
    searchTerm: string;
    indentation?: number;
}

export const PlaylistItem = ({ playlist, searchTerm, indentation = -2 }: Props) => {
    const { config } = useConfigContext();
    const { currentlyPlayingUri: currentlyPlayingUri, draggingSourceUri, onDraggingDropped, renamingUri, setRenamingUri } = useFilterContext();

    const [img, setImg] = useState<string>(playlist.images.length > 0 ? playlist.images[0].url : "");
    const [dragDepth, setDragDepth] = useState(0);
    const [playlistName, setPlaylistName] = useState(playlist.name);

    const goToPlaylist = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();

        const href = Spicetify.URI.from(playlist.uri)?.toURLPath(true)

        if (href) {
            Spicetify.Platform.History.push(href);
        }
    };
    useEffect(() => {
        if (config[ConfigKey.UsePlaylistCovers]) {
            getPlaylistArtwork(playlist.uri).then((img) => setImg(img as string));
        }
    }, []);

    const addToPlaylist = (_e: React.DragEvent<any>) => {
        // TODO: Check if song exists
        if (!!draggingSourceUri.length) {
            SpotifyClient.addSongToPlaylist(playlist.uri, draggingSourceUri)
                .then(() => Spicetify.showNotification(Spicetify.Locale._dictionary[LocaleKey.FeedbackAddedToPlaylistGeneric]));
        }

        onDraggingDropped();
        onDragLeave();
    };

    const outerRef = useRef<HTMLDivElement>(null);
    const listItemRef = useRef<HTMLLIElement>(null);
    const renameInputRef = useRef<HTMLInputElement>(null);

    const onDragEnter = (e: React.DragEvent<any>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!!draggingSourceUri.length && playlist.isOwnedBySelf) {
            setDragDepth(dragDepth => dragDepth + 1);
            outerRef.current?.classList.add("GlueDropTarget--active");
            listItemRef.current?.classList.add("xbsDt2_VfIDs0cQOXvgf");
        }
    };

    const onDragLeave = (e?: React.DragEvent<any>) => {
        e?.preventDefault();
        e?.stopPropagation();

        if (!!draggingSourceUri.length) {
            const newDragDepth = Math.max(dragDepth - 1, 0);

            setDragDepth(newDragDepth);

            if (newDragDepth === 0) {
                outerRef.current?.classList.remove("GlueDropTarget--active");
                listItemRef.current?.classList.remove("xbsDt2_VfIDs0cQOXvgf");
            }
        } else {
            outerRef.current?.classList.remove("GlueDropTarget--active");
            listItemRef.current?.classList.remove("xbsDt2_VfIDs0cQOXvgf");
        }
    };

    const usePlaylistCovers = config[ConfigKey.UsePlaylistCovers];

    useEffect(() => {
        outerRef.current?.classList.remove("GlueDropTarget--active");
        listItemRef.current?.classList.remove("xbsDt2_VfIDs0cQOXvgf");
    }, [draggingSourceUri]);

    useEffect(() => {
        if (renamingUri === playlist.uri) {
            renameInputRef.current?.focus();
        }
    }, [renamingUri]);

    const stopRenamingPlaylist = (e: React.FocusEvent<HTMLInputElement, Element>) => {
        setRenamingUri("");
        setPlaylistName(playlist.name);
    };

    const renamePlaylist = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const newName = e.currentTarget.value;

            SpotifyClient.renamePlaylist(playlist.uri, newName)
            setRenamingUri("");
            playlist.name = newName;
        } else if (e.key === "Escape") {
            setRenamingUri("");
        }
    };

    const imageComponent = useMemo(() => (
        img !== "" ? <img src={img}
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
            dangerouslySetInnerHTML={{ __html: Spicetify.SVGIcons["playlist"] }} />
    ), []);

    // TODO: use ListItem component
    // return (
    //     <ListItem
    //         href={`/playlist/${playlist.uri.replace("spotify:playlist:", "")}`}
    //         imageComponent={imageComponent}
    //         isOwnedBySelf={playlist.isOwnedBySelf}
    //         name={playlist.name}
    //         onClick={goToPlaylist}
    //         onDoubleClick={() => startPlaybackFromItem(playlist)}
    //         onDrop={addToPlaylist}
    //         indentation={indentation}
    //     >
    //         {currentlyPlayingUri === playlist.uri
    //             ? <NowPlayingIndicator />
    //             : playlist.isCollaborative ?
    //                 <CollaborativeIcon />
    //                 : <></>
    //         }
    //     </ListItem>
    // );

    return (
        <RightClickMenu
            uri={playlist.uri}
            isOwnedBySelf={playlist.isOwnedBySelf}
            playlistName={playlist.name}
        >
            {
                (openMenu: (e: React.MouseEvent) => any) => (
                    <div
                        ref={outerRef}
                        className={playlist.isOwnedBySelf ? `GlueDropTarget GlueDropTarget--albums GlueDropTarget--tracks GlueDropTarget--local-tracks GlueDropTarget--episodes GlueDropTarget--playlists GlueDropTarget--folders` : "GlueDropTarget GlueDropTarget--playlists GlueDropTarget--folders"}
                        onDrop={addToPlaylist}
                        onDragEnter={onDragEnter}
                        onDragLeave={onDragLeave}
                        onContextMenu={openMenu}
                    >
                        <li
                            ref={listItemRef}
                            role="listitem" class={`main-rootlist-rootlistItem playlist-item`} draggable="true"
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
                                {usePlaylistCovers ? imageComponent : <></>}
                                <a
                                    aria-current="page"
                                    className={`standalone-ellipsis-one-line main-rootlist-rootlistItemLink playlist-filter-results-playlist-link ${currentPageIsPlaylist(playlist.uri) ? "main-rootlist-rootlistItemLinkActive" : ""}`}
                                    draggable="false"
                                    href={`/playlist/${playlist.uri.replace("spotify:playlist:", "")}`}
                                    onClick={goToPlaylist}
                                    onDoubleClick={() => startPlaybackFromItem(playlist)}
                                >
                                    {
                                        renamingUri === playlist.uri ?
                                            <input
                                                ref={renameInputRef}
                                                onBlur={stopRenamingPlaylist}
                                                onKeyDown={renamePlaylist}
                                                type="text"
                                                className="daCBcwvAGyqpyuBNaWTY"
                                                draggable="true"
                                                value={playlistName}
                                                onChange={(e) => setPlaylistName(e.currentTarget.value)}
                                            />
                                            : (
                                                <span
                                                    className="Type__TypeElement-sc-goli3j-0 gkqrGP main-rootlist-textWrapper"
                                                    dir="auto"
                                                >
                                                    <span dangerouslySetInnerHTML={{ __html: getNameWithHighlightedSearchTerm(playlistName, searchTerm) }} />
                                                </span>
                                            )
                                    }

                                </a>
                                {currentlyPlayingUri === playlist.uri
                                    ? <NowPlayingIndicator />
                                    : playlist.isCollaborative ?
                                        <CollaborativeIcon />
                                        : <></>
                                }
                            </div>
                        </li>
                    </div>
                )
            }
        </RightClickMenu>
    );
};

