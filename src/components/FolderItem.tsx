import React, { useMemo } from "react";
import { getConfig, ConfigKey } from "../config/Config";
import { Folder } from "../models/Folder";
import { ItemType } from "../models/Item";
import { Playlist } from "../models/Playlist";
import { flattenLibrary, folderItemsContainsSearchTerm, getNameWithHighlightedSearchTerm, sortItemsBySearchTerm } from "../utils/utils";
import { PlaylistItem } from "./PlaylistItem";

interface Props {
    searchTerm: string;
    folder: Folder;
    indentation?: number;
    deadEnd: boolean;
    recursiveOpen?: boolean;
}

const FolderItem = ({ searchTerm, folder, indentation = 0, deadEnd, recursiveOpen }: Props) => {
    const [folderIsOpen, setFolderIsOpen] = React.useState(recursiveOpen);

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
            setFolderIsOpen(false);
        } else {
            setFolderIsOpen(true);
        }
    }

    const sortedSearchResults = useMemo(() => {
        const items = folder.items
            .filter(item => item.type === ItemType.Folder || item.type === ItemType.Playlist) as (Playlist | Folder)[];

        return items
            .sort((a, b) => sortItemsBySearchTerm(a, b, searchTerm))
    }, [searchTerm]);

    return (
        <>
            <li
                role="listitem"
                class="main-rootlist-rootlistItem playlist-item"
                draggable="true"
                style={{
                    // @ts-ignore
                    "--indentation": indentation,
                    cursor: deadEnd ? "default" : "pointer",
                }}
                aria-expanded="false"
            >
                <div
                    aria-hidden="true"
                    className="main-rootlist-rootlistItemOverlay"
                />

                <svg
                    height="1.5em"
                    width="1.5em"
                    fill="currentColor"
                    style={{
                        marginRight: 12,
                        padding: 3,
                    }}
                    dangerouslySetInnerHTML={{ __html: Spicetify.SVGIcons["playlist-folder"] }} />

                <a
                    className="standalone-ellipsis-one-line main-rootlist-rootlistItemLink"
                    draggable="false"
                    onClick={goToFolder}
                >
                    <span
                        className="Type__TypeElement-sc-goli3j-0 gkqrGP main-rootlist-textWrapper"
                        dir="auto"
                    >
                        <span dangerouslySetInnerHTML={{ __html: getNameWithHighlightedSearchTerm(folder.name, searchTerm) }} />
                    </span>
                </a>

                <button
                    className="Button-sc-1dqy6lx-0 cWIysU main-rootlist-expandArrow"
                    aria-label="Expand folder"
                    onClick={toggleFolderOpen}
                    disabled={deadEnd}
                >
                    <span
                        aria-hidden="true"
                        className="IconWrapper__Wrapper-sc-16usrgb-0 eJHlti"
                        style={{
                            transform: folderIsOpen ? "rotate(90deg)" : "rotate(0deg)",
                        }}
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
                sortedSearchResults
                    .map((item, i) => {
                        if (item.type === ItemType.Folder) {
                            if (shouldRenderFolder(item, searchTerm)) {
                                const isDeadEnd = folderIsDeadEnd(item, searchTerm);

                                return (
                                    <FolderItem
                                        searchTerm={searchTerm}
                                        folder={item}
                                        key={item.uri + i}
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
                                        key={item.uri + i}
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

    // if (TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS) {
    //     return folderItemsContainsSearchTerm(folder, searchTerm);
    // }

    return false;
}

function folderContainsPlaylist(folder: Folder, searchTerm: string) {
    // searches recursively
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