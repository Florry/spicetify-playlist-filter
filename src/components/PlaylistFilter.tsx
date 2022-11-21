import React, { useEffect, useMemo, useRef, useState } from "react";
import getAllPlaylistData from "../clients/CosmosClient";
import { SpotifyClient } from "../clients/SpotifyClient";
import { getConfig } from "../config/Config";
import { TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS, USE_KEYBOARD_SHORTCUTS } from "../constants/constants";
import { Folder } from "../models/Folder";
import { Playlist } from "../models/Playlist";
import { flattenLibrary, folderItemsContainsSearchTerm } from "../utils/utils";
import FolderItem, { folderIsDeadEnd, shouldRenderFolder } from "./FolderItem";
import { PlaylistItem } from "./PlaylistItem";
import { clearButtonStyling, searchInputStyling, searchStyling, ulStyling } from "./styling/PlaylistFilterStyling";

interface Props {
    onFilter: (searchCleared: boolean) => void;
}

export const SearchInput = (({ onFilter }: Props) => {
    const [playlists, setPlaylists] = useState<(Playlist | Folder)[]>([]);
    const [playlistContainer, setPlaylistContainer] = useState(document.querySelector("#spicetify-playlist-list"));
    const [searchTerm, setSearchTerm] = useState("");

    const getPlaylists = async () => {
        const library = await SpotifyClient.getLibrary();
        const playlists = flattenLibrary(library);

        setPlaylists(playlists);
    };

    const searchInput = useRef<HTMLInputElement>(null);

    useEffect(() => {
        getPlaylists();

        Spicetify.Keyboard.registerImportantShortcut("f", async () => {
            if (getConfig(USE_KEYBOARD_SHORTCUTS)) {
                /* Without setImmediate here, the value of searchInput is set to f for some reason */
                setImmediate(() => {
                    if (searchInput.current)
                        searchInput.current.focus();
                });
            }
        });

        // Refreshes playlists every 30 min
        // TODO: Make this configurable
        setInterval(() => getPlaylists(), 1000 * 30 * 60);
    }, []);

    const filterPlaylists = async (value: string) => {
        // TODO:
        getAllPlaylistData();

        if (!playlistContainer)
            await setPlaylistContainer(document.querySelector("#spicetify-playlist-list"));

        await setSearchTerm(value === " " ? "" : value);

        if (value === "" || value === " ") {
            onFilter(true);
            playlistContainer?.removeAttribute("style");
        }
        else {
            onFilter(false);
            playlistContainer?.setAttribute("style", "display: none;");
        }

    }

    const clearFilter = async () => {
        await filterPlaylists(" ");
    };

    const searchResults = useMemo(() => playlists.filter((playlist: (Playlist | Folder)) => {
        return playlist.name?.toLowerCase().includes(searchTerm.toLowerCase());
    }), [searchTerm]);

    const sortedSearchResults = useMemo(() => searchResults.sort((a, b) => {
        const aMatch = a.name?.toLowerCase().indexOf(searchTerm.toLowerCase()) + a.name.length;
        const bMatch = b.name?.toLowerCase().indexOf(searchTerm.toLowerCase()) + b.name.length;

        // TODO: take into account the number of matches?

        if (aMatch > bMatch)
            return 1;
        else if (aMatch < bMatch)
            return -1;
        else
            return 0;
    }), [searchResults]);

    return (
        <>
            <div
                id="playlist-filter-main-container"
                className="main-navBar-navBarItem"
                style={searchStyling}
            >
                <input
                    id="playlist-filter-input"
                    style={searchInputStyling}
                    // @ts-ignore
                    ref={searchInput}
                    placeholder="Filter"
                    value={searchTerm}
                    onChange={(e) => filterPlaylists(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            clearFilter();
                            searchInput.current?.blur();
                        }
                    }}
                />
                {
                    searchTerm !== "" &&
                    <div
                        id="playlist-filter-clear-btn"
                        style={clearButtonStyling}
                        title="Clear filter"
                        onClick={clearFilter}
                    >
                        <svg
                            style={{
                                fill: "var(--text-subdued)"
                            }}
                            dangerouslySetInnerHTML={{
                                // @ts-ignore
                                __html: Spicetify.SVGIcons["x"]
                            }} />
                    </div>
                }
            </div>

            {
                searchTerm &&
                <>
                    <div
                        id="playlist-filter-results-divider-container"
                        className="main-rootlist-rootlistDividerContainer"
                    >
                        <hr
                            id="playlist-filter-divider"
                            className="main-rootlist-rootlistDivider"
                        />
                        <div
                            id="playlist-filter-results-divider-gradient"
                            className="main-rootlist-rootlistDividerGradient"
                        />
                    </div>
                    <ul
                        id="playlist-filter-results"
                        style={ulStyling}
                    >
                        {sortedSearchResults
                            .map((item: any, i: number) => {
                                if (item.type === "folder") {
                                    const containsSearchTerm = folderItemsContainsSearchTerm(item, searchTerm);
                                    const isDeadEnd = folderIsDeadEnd(item, searchTerm);

                                    if (shouldRenderFolder(item, searchTerm)) {
                                        return (
                                            <FolderItem
                                                searchTerm={searchTerm}
                                                folder={item}
                                                key={item.uri + i}
                                                deadEnd={TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS ? isDeadEnd : false}
                                            />
                                        );
                                    }
                                } else {
                                    return (
                                        <PlaylistItem
                                            searchTerm={searchTerm}
                                            playlist={item}
                                            key={item.uri + i}
                                        />
                                    );
                                }
                            })}
                    </ul>
                </>
            }
        </>
    );
});