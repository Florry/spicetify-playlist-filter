import React, { useMemo } from "react";
import { TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS, TEMP_CONFIG_OPEN_FOLDERS_RECURSIVE, TEMP_CONFIG_SHOW_DEAD_ENDS } from "../constants/constants";
import { Folder } from "../models/Folder";
import { Item } from "../models/Item";
import { Playlist } from "../models/Playlist";
import { flattenLibrary, folderItemsContainsSearchTerm, getNameWithHighlightedSearchTerm } from "../utils/utils";
import { PlaylistItem } from "./PlaylistItem";

// TODO: sort items within folders by how well they match the search term
interface Props {
    searchTerm: string;
    folder: Folder;
    indentation?: number;
    deadEnd: boolean;
    recursiveOpen?: boolean;
}

const FolderItem = ({ searchTerm, folder, indentation = 0, deadEnd, recursiveOpen }: Props) => {
    const [folderIsOpen, setFolderIsOpen] = React.useState(recursiveOpen);

    // TODO:
    const goToFolder = (e: React.MouseEvent<any>) => {
        e.preventDefault();

        // const href = Spicetify.URI.from(folder.uri)?.toURLPath(true)

        // if (href) {
        // 	Spicetify.Platform.History.push(href);
        // }
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
                onClick={goToFolder}
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
                    // @ts-ignore
                    tabindex="-1"
                    href="/folder/e9c10fbbe64c2a96"
                >
                    <span
                        className="Type__TypeElement-goli3j-0 gJFKvJ main-rootlist-textWrapper"
                        dir="auto"
                    >
                        <span dangerouslySetInnerHTML={{ __html: getNameWithHighlightedSearchTerm(folder.name, searchTerm) }} />
                    </span>
                </a>

                <button
                    // @ts-ignore
                    tabindex="-1"
                    className="Button-sc-1dqy6lx-0 dmmeCL main-rootlist-expandArrow main-rootlist-expandArrowActive"
                    aria-label="Expand folder"
                    onClick={toggleFolderOpen}
                    disabled={deadEnd}
                >
                    {deadEnd && TEMP_CONFIG_SHOW_DEAD_ENDS ? "Dead-end" : <span
                        aria-hidden="true"
                        className="IconWrapper__Wrapper-sc-16usrgb-0 bxwPwV"
                        style={{
                            transform: folderIsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                        }}
                    >

                        <svg
                            role="img"
                            height="16"
                            width="16"
                            viewBox="0 0 16 16"
                            className="Svg-ytk21e-0 jAKAlG"
                        >
                            <path
                                d="M14 6l-6 6-6-6h12z"
                            />
                        </svg>
                    </span>}

                </button>
            </li>

            {
                folderIsOpen &&
                folder.items.map((item, i) => {
                    if (item.type === Item.Folder) {
                        if (shouldRenderFolder(item, searchTerm)) {
                            const isDeadEnd = folderIsDeadEnd(item, searchTerm);

                            return (
                                <FolderItem
                                    searchTerm={searchTerm}
                                    folder={item}
                                    key={item.uri + i}
                                    indentation={indentation + 1}
                                    deadEnd={TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS ? isDeadEnd : false}
                                    recursiveOpen={TEMP_CONFIG_OPEN_FOLDERS_RECURSIVE ? folderContainsImmediateResult(folder, searchTerm) : false}
                                />
                            );
                        }
                    } else if (item.type === Item.Playlist) {
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
    if (TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS) {
        const containsSearchTerm = folderItemsContainsSearchTerm(folder, searchTerm);

        return folder.name?.toLowerCase().includes(searchTerm.toLowerCase()) || containsSearchTerm;
    } else {
        return true;
    }
}

function shouldRenderPlaylist(playlist: Playlist, searchTerm: string) {
    if (TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS) {
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
        return item.type === Item.Playlist && item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });
}

function folderContainsImmediateResult(folder: Folder, searchTerm: string) {
    return !folder.items.find(item => {
        if (item.type === Item.Folder) {
            return item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (item.type === Item.Playlist) {
            return item.name?.toLowerCase().includes(searchTerm.toLowerCase());
        }
    });
}