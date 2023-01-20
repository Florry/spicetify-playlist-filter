import React, { useEffect, useMemo, useRef, useState } from "react";
import FilterIcon from "../assets/icons/FilterIcon";
import SpotifyIcon from "../assets/icons/SpotifyIcon";
import getPlaylistData from "../clients/CosmosClient";
import { SpotifyClient } from "../clients/SpotifyClient";
import { ConfigKey, getConfig } from "../config/Config";
import { FilterState, SortOption } from "../constants/constants";
import { FilterContext } from "../context/context";
import { Folder } from "../models/Folder";
import { Playlist } from "../models/Playlist";
import { flattenLibrary, getConfiguredKeyboardKeys, sortItemsBySearchTerm } from "../utils/utils";
import FolderItem, { folderIsDeadEnd, shouldRenderFolder } from "./FolderItem";
import { PlaylistItem } from "./PlaylistItem";
import SortOrderSelector from "./SortOrderSelector";
import { clearButtonStyling, searchInputStyling, searchStyling, ulStyling } from "./styling/PlaylistFilterStyling";

let searchInputElement: HTMLInputElement | null = null;

export function registerKeyboardShortcut() {
    Spicetify.Keyboard.registerImportantShortcut(getConfiguredKeyboardKeys(), async () => {
        /* Without setImmediate here, the value of searchInput is set to f for some reason */
        setImmediate(() => {
            if (searchInputElement)
                searchInputElement.focus();
        });
    });
}

interface Props {
    onFilter: (searchCleared: boolean) => void;
}

export const SearchInput = (({ onFilter }: Props) => {
    const [filterState, setFilterState] = useState<FilterState>({
        currentlyPlayingUri: "",
        draggingUri: "",
        searchQuery: "",
        sortOption: getConfig(ConfigKey.DefaultSorting),
    });

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

        if (getConfig(ConfigKey.UsePlaylistCovers)) {
            getPlaylistData();
        }

        if (getConfig(ConfigKey.UseKeyboardShortcuts)) {
            /* A bit of a hack to be able to register/deregister shortcuts from config, but it will do */
            searchInputElement = searchInput.current;
            registerKeyboardShortcut();
        }

        const getPlaylistsInterval = setInterval(() => {
            getPlaylistData();

            if (!getConfig(ConfigKey.UsePlaylistCovers)) {
                getPlaylistData();
            }
        }, getConfig(ConfigKey.PlaylistListRefreshInterval));

        const setCurrentPlayingPlaylistUri = () => {
            const currentlyPlayingPlaylistUri = Spicetify.Player.data.context_uri;

            setFilterState({
                ...filterState,
                currentlyPlayingUri: currentlyPlayingPlaylistUri,
            });
        };

        Spicetify.Player.addEventListener("onplaypause", setCurrentPlayingPlaylistUri);
        Spicetify.Player.addEventListener("songchange", setCurrentPlayingPlaylistUri);

        setCurrentPlayingPlaylistUri();

        return () => {
            clearInterval(getPlaylistsInterval);
            Spicetify.Player.removeEventListener("onplaypause", setCurrentPlayingPlaylistUri);
            Spicetify.Player.removeEventListener("songchange", setCurrentPlayingPlaylistUri);
        }
    }, []);

    const resetSorting = () => setFilterState({
        ...filterState,
        sortOption: getConfig(ConfigKey.DefaultSorting),
    });


    const [debouncResetSortingToDefaultInterval, setDebouncResetSortingToDefaultInterval] = useState<NodeJS.Timeout | null>(null);

    const filterPlaylists = async (value: string) => {
        if (!playlistContainer) {
            await setPlaylistContainer(document.querySelector("#spicetify-playlist-list"));
        }

        if (debouncResetSortingToDefaultInterval) {
            clearInterval(debouncResetSortingToDefaultInterval);
        }

        await setSearchTerm(value === " " ? "" : value);

        if (value === "" || value === " ") {
            onFilter(true);
            playlistContainer?.removeAttribute("style");

            if (getConfig(ConfigKey.DebounceDefaultSorting)) {
                setDebouncResetSortingToDefaultInterval(setTimeout(() => resetSorting(), getConfig(ConfigKey.SortingDebounceTime)));
            } else {
                resetSorting();
            }
        }
        else {
            onFilter(false);
            playlistContainer?.setAttribute("style", "display: none;");
        }
    }

    const clearFilter = async () => {
        await filterPlaylists("");
        resetSorting();
    };

    const searchResults = useMemo(() => playlists.filter((playlist: (Playlist | Folder)) => {
        return playlist.name?.toLowerCase().includes(searchTerm.toLowerCase());
    }), [searchTerm]);

    const sortedSearchResults = useMemo(() => searchResults.sort((a, b) => sortItemsBySearchTerm(a, b, searchTerm, filterState.sortOption)), [searchTerm, filterState.sortOption]);

    const setSortOption = (option: SortOption) => {
        setFilterState({
            ...filterState,
            sortOption: option,
        });
    }

    return (
        <FilterContext.Provider value={filterState}>
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
                    (
                        <>
                            <SortOrderSelector onChange={setSortOption} />
                            <div
                                id="playlist-filter-clear-btn"
                                style={clearButtonStyling}
                                title="Clear filter"
                                onClick={clearFilter}
                            >
                                <SpotifyIcon
                                    style={{ fill: "var(--text-subdued)" }}
                                    icon="x"
                                />
                            </div>
                        </>
                    )
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
                                    const isDeadEnd = folderIsDeadEnd(item, searchTerm);

                                    if (getConfig(ConfigKey.IncludeFoldersInResult) && shouldRenderFolder(item, searchTerm)) {
                                        return (
                                            <FolderItem
                                                searchTerm={searchTerm}
                                                folder={item}
                                                key={item.uri + i}
                                                deadEnd={getConfig(ConfigKey.HideUnrelatedInFolders) ? isDeadEnd : false}
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
        </FilterContext.Provider>
    );
});


