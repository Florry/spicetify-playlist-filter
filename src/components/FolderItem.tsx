import React, { useMemo } from "react";
import SpotifyIcon from "../assets/icons/SpotifyIcon";
import { getConfig, ConfigKey } from "../config/Config";
import { useFilterContext } from "../context/context";
import { Folder } from "../models/Folder";
import { ItemType } from "../models/Item";
import { Playlist } from "../models/Playlist";
import { currentPageIsFolder, flattenLibrary, folderItemsContainsSearchTerm, getNameWithHighlightedSearchTerm, setFolderOpenState, sortItems, startPlaybackFromItem } from "../utils/utils";
import NowPlayingIndicator from "./NowPlayingIndicator";
import { PlaylistItem } from "./PlaylistItem";
import { listItemStyling, mainRootlistItemRootlistItemStyling } from "./styling/PlaylistItemStyling";

interface Props {
    searchTerm: string;
    folder: Folder;
    indentation?: number;
    deadEnd: boolean;
    recursiveOpen?: boolean;
}

const FolderItem = ({ searchTerm, folder, indentation = 0, deadEnd, recursiveOpen }: Props) => {
    const { sortOption, sortOptionWithoutFiltering, isSortingWithoutFiltering: sortingWithoutFiltering, currentlyPlayingUri, openLibraryFolders } = useFilterContext();
    const [folderIsOpen, setFolderIsOpen] = React.useState(recursiveOpen || sortingWithoutFiltering && openLibraryFolders.includes(folder.uri));

    const goToFolder = (e: React.MouseEvent<any>) => {
        e.preventDefault();

        const href = Spicetify.URI.from(folder.uri)?.toURLPath(true)

        if (href) {
            Spicetify.Platform.History.push(href);
        }
    };

    const toggleFolderOpen = (e: React.MouseEvent<any>) => {
        if (deadEnd) {
            return;
        }

        e.preventDefault();

        if (folderIsOpen) {
            if (getConfig(ConfigKey.SyncOpeningFoldersBetweenSorting)) {
                setFolderOpenState(folder.uri, false);
            }

            setFolderIsOpen(false);
        } else {
            if (getConfig(ConfigKey.SyncOpeningFoldersBetweenSorting)) {
                setFolderOpenState(folder.uri, true);
            }

            setFolderIsOpen(true);
        }
    }

    const sortedItems = useMemo(() => {
        const items = folder.items
            .filter(item => item.type === ItemType.Folder || item.type === ItemType.Playlist) as (Playlist | Folder)[];

        return items
            .sort((a, b) => sortItems(a, b, searchTerm, sortingWithoutFiltering ? sortOptionWithoutFiltering : sortOption))
    }, [searchTerm, sortOption, sortOptionWithoutFiltering]);

    return (
        <>
            <li
                role="listitem"
                class="main-rootlist-rootlistItem playlist-item"
                draggable="true"
                style={{
                    ...listItemStyling,
                    // @ts-ignore
                    "--indentation": indentation,
                }}
                aria-expanded="false"
            >
                <div
                    aria-hidden="true"
                    className="main-rootlist-rootlistItemOverlay"
                />

                <div
                    aria-current="page"
                    className="standalone-ellipsis-one-line main-rootlist-rootlistItemLink"
                    draggable="false"
                >
                    {
                        getConfig(ConfigKey.UsePlaylistCovers) && (
                            <SpotifyIcon
                                height="1.5em"
                                width="1.5em"
                                fill="currentColor"
                                style={{
                                    marginRight: 12,
                                    padding: 3,
                                }}
                                icon="playlist-folder"
                            />
                        )
                    }

                    <a
                        className={`standalone-ellipsis-one-line main-rootlist-rootlistItemLink playlist-filter-results-playlist-link ${currentPageIsFolder(folder.uri) ? "main-rootlist-rootlistItemLinkActive" : ""}`}
                        draggable="true"
                        href={`/folder/${folder.uri.replace("spotify:folder:", "")}`}
                        onClick={goToFolder}
                        onDoubleClick={() => startPlaybackFromItem(folder)}
                    >
                        <span
                            className="Type__TypeElement-sc-goli3j-0 gkqrGP main-rootlist-textWrapper"
                            dir="auto"
                        >
                            <span dangerouslySetInnerHTML={{ __html: getNameWithHighlightedSearchTerm(folder.name, searchTerm) }} />
                        </span>
                    </a>
                </div>
                {currentlyPlayingUri === folder.uri && <div style={{ marginRight: 10 }}><NowPlayingIndicator /></div>}
                <button
                    className="Button-sc-1dqy6lx-0 cWIysU main-rootlist-expandArrow"
                    aria-label="Expand folder"
                    onClick={toggleFolderOpen}
                    disabled={deadEnd}
                >
                    <span
                        aria-hidden="true"
                        className="IconWrapper__Wrapper-sc-16usrgb-0 eJHlti"
                        style={{ transform: folderIsOpen ? "rotate(90deg)" : "rotate(0deg)" }}
                    >

                        <svg
                            role="img"
                            height="16"
                            width="16"
                            aria-hidden="true"
                            viewBox="0 0 16 16"
                            className="Svg-sc-ytk21e-0 uPxdw">
                            <path d="M14 6l-6 6-6-6h12z">
                            </path>
                        </svg>
                    </span>

                </button>
            </li>

            {
                folderIsOpen &&
                sortedItems
                    .map((item, i) => {
                        if (item.type === ItemType.Folder) {
                            if (shouldRenderFolder(item, searchTerm)) {
                                const isDeadEnd = folderIsDeadEnd(item, searchTerm);

                                return (
                                    <FolderItem
                                        searchTerm={searchTerm}
                                        folder={item}
                                        key={item.uri + folder.uri}
                                        indentation={indentation + 1}
                                        deadEnd={getConfig(ConfigKey.HideUnrelatedInFolders) ? isDeadEnd : false}
                                        recursiveOpen={getConfig(ConfigKey.OpenFoldersRecursively) ? folderContainsImmediateResult(folder, searchTerm) : false}
                                    />
                                );
                            }
                        } else if (item.type === ItemType.Playlist) {
                            if (shouldRenderPlaylist(item, searchTerm)) {
                                return (
                                    <PlaylistItem
                                        searchTerm={searchTerm}
                                        playlist={item}
                                        key={item.uri + folder.uri}
                                        indentation={indentation - 0.5}
                                    />
                                )
                            }
                        }
                    })
            }

        </>
    );
};

export default FolderItem;

export function shouldRenderFolder(folder: Folder, searchTerm: string) {
    if (getConfig(ConfigKey.HideUnrelatedInFolders)) {
        const containsSearchTerm = folderItemsContainsSearchTerm(folder, searchTerm);

        return folder.name?.toLowerCase().includes(searchTerm.toLowerCase()) || containsSearchTerm;
    } else {
        return true;
    }
}

function shouldRenderPlaylist(playlist: Playlist, searchTerm: string) {
    if (getConfig(ConfigKey.HideUnrelatedInFolders)) {
        return playlist.name?.toLowerCase().includes(searchTerm.toLowerCase());
    } else {
        return true;
    }
}

export function folderIsDeadEnd(folder: Folder, searchTerm: string) {
    if (!folderContainsPlaylist(folder, searchTerm)) {
        return true;
    }

    return false;
}

function folderContainsPlaylist(folder: Folder, searchTerm: string) {
    const flattenedLibrary = flattenLibrary([folder]);

    return flattenedLibrary.find(item => {
        return item.type === ItemType.Playlist && item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
}

function folderContainsImmediateResult(folder: Folder, searchTerm: string) {
    return !folder.items.find(item => {
        if (item.type === ItemType.Folder) {
            return item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (item.type === ItemType.Playlist) {
            return item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        }
    });
}