import React, { useEffect, useMemo, useRef, useState } from "react";
import SpotifyIcon from "../assets/icons/SpotifyIcon";
import { SpotifyClient } from "../clients/SpotifyClient";
import { ConfigKey, getConfig } from "../config/Config";
import { FilterState, SortOption } from "../constants/constants";
import { FilterContext } from "../context/context";
import { Folder } from "../models/Folder";
import { Playlist } from "../models/Playlist";
import { flattenLibrary, getConfiguredKeyboardKeys, getOpenFolderState, sanitizeLibrary, sortItems } from "../utils/utils";
import DebugPanel from "./DebugPanel";
import FolderItem, { folderIsDeadEnd, shouldRenderFolder } from "./FolderItem";
import { PlaylistItem } from "./PlaylistItem";
import SortOrderSelector from "./SortOrderSelector";
import { clearButtonStyling, searchInputStyling, searchStyling, ulStyling } from "./styling/PlaylistFilterStyling";

let searchInputElement: HTMLInputElement | null = null;

// TODO: this file has become a mess, clean it up

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

export const FilterInput = (({ onFilter }: Props) => {
    const [filterTerm, setFilterTerm] = useState<string>("");
    const [currentlyPlayingUri, setCurrentlyPlayingUri] = useState<string>("");
    const [draggingSourceUri, setDraggingSourceUri] = useState<string>("");
    const [draggingSourceName, setDraggingSourceName] = useState<string>("");
    const [sortOption, setSortOption] = useState<SortOption>(getConfig(ConfigKey.DefaultSorting));
    const [sortOptionWithoutFiltering, setSortOptionWithoutFiltering] = useState<SortOption>(SortOption.Custom);
    const [isSortingWithoutFiltering, setSortingWithoutFiltering] = useState<boolean>(false);
    const [openLibraryFolders, setOpenLibraryFolders] = useState<string[]>([]);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const filterState: FilterState = {
        filterTerm,
        currentlyPlayingUri,
        draggingSourceUri,
        draggingSourceName,
        sortOption,
        sortOptionWithoutFiltering,
        isSortingWithoutFiltering,
        openLibraryFolders,
        isPlaying,

        onDraggingDropped: () => {
            setDraggingSourceUri("");
            setDraggingSourceName("");
        }
    }

    useEffect(() => {
        if (!filterState.filterTerm.length && filterState.sortOptionWithoutFiltering !== SortOption.Custom) {
            setSortingWithoutFiltering(true);
        } else {
            setSortingWithoutFiltering(false);
        }
    }, [filterState.filterTerm, filterState.sortOptionWithoutFiltering]);

    const [playlists, setPlaylists] = useState<(Playlist | Folder)[]>([]);
    const [library, setLibrary] = useState<(Playlist | Folder)[]>([]);
    const [playlistContainer, setPlaylistContainer] = useState(document.querySelector("#spicetify-playlist-list"));

    const getPlaylists = async () => {
        const library = await SpotifyClient.getLibrary();
        const playlists = flattenLibrary(library);

        setPlaylists(playlists);

        if (getConfig(ConfigKey.FlattenLibraryWhenSortingOtherThanCustom)) {
            setLibrary(playlists);
        } else {
            setLibrary(sanitizeLibrary(library));
        }
    };

    const searchInput = useRef<HTMLInputElement>(null);

    /* Super hacky way to get the song uri from a playlist html element */
    const setDraggingSource = async (e: Event) => {
        // Dragging from playlist?
        // @ts-ignore
        const songName = e?.target?.querySelector(".main-trackList-rowTitle")?.innerText;
        // @ts-ignore
        const albumUrl = e.target?.querySelector(".Type__TypeElement-sc-goli3j-0.hGXzYa")?.firstChild?.href;

        if (albumUrl && songName) {
            const albumUri = albumUrl?.substring(albumUrl?.lastIndexOf("/") + 1, albumUrl?.length);
            const songUri = await SpotifyClient.getSongFromAlbum(albumUri, songName);

            setDraggingSourceUri(songUri);
            setDraggingSourceName(songName);
        } else {
            // Dragging from now playing?
            console.log(e?.target);

            // @ts-ignore
            if (e?.target?.querySelector('a[referrer="now_playing_bar"]')) {
                if (Spicetify.Player.data.track?.uri && Spicetify.Player.data.track?.metadata?.title) {
                    setDraggingSourceUri(Spicetify.Player.data.track?.uri);
                    setDraggingSourceName(Spicetify.Player.data.track?.metadata?.title);
                }
            }
        }
    };

    useEffect(() => {
        getPlaylists();

        if (getConfig(ConfigKey.UsePlaylistCovers)) {
            SpotifyClient.getPlaylistData();
        }

        if (getConfig(ConfigKey.UseKeyboardShortcuts)) {
            /* A bit of a hack to be able to register/deregister shortcuts from config, but it will do */
            searchInputElement = searchInput.current;
            registerKeyboardShortcut();
        }

        const getPlaylistsInterval = setInterval(() => {
            getPlaylists();

            if (!getConfig(ConfigKey.UsePlaylistCovers)) {
                SpotifyClient.getPlaylistData();
            }
        }, getConfig(ConfigKey.PlaylistListRefreshInterval));

        const setCurrentPlayingPlaylistUri = () => {
            const currentlyPlayingPlaylistUri = Spicetify.Player.data.context_uri;

            setCurrentlyPlayingUri(currentlyPlayingPlaylistUri);
        };

        const onPlayPause = (e: Event & { data: Spicetify.PlayerState }) => {
            setCurrentPlayingPlaylistUri();
            setIsPlaying(!e.data.is_paused);
        };

        Spicetify.Player.addEventListener("onplaypause", onPlayPause as any);
        Spicetify.Player.addEventListener("songchange", setCurrentPlayingPlaylistUri);

        const debounceResetDraggingSource = () => setTimeout(() => filterState.onDraggingDropped(), 200)

        window.document.querySelector("body")?.addEventListener("dragstart", setDraggingSource);
        window.document.querySelector("body")?.addEventListener("dragend", debounceResetDraggingSource);

        setCurrentPlayingPlaylistUri();

        return () => {
            clearInterval(getPlaylistsInterval);
            Spicetify.Player.removeEventListener("onplaypause", setCurrentPlayingPlaylistUri);
            Spicetify.Player.removeEventListener("songchange", setCurrentPlayingPlaylistUri);
            window.document.querySelector("body")?.removeEventListener("dragStart", setDraggingSource);
            window.document.querySelector("body")?.removeEventListener("dragend", debounceResetDraggingSource);
        }
    }, []);

    const resetSorting = () => setSortOption(getConfig(ConfigKey.DefaultSorting));

    const [debouncResetSortingToDefaultInterval, setDebouncResetSortingToDefaultInterval] = useState<NodeJS.Timeout | null>(null);

    const filterPlaylists = async (value: string, debounce: boolean = true) => {
        if (debouncResetSortingToDefaultInterval) {
            clearInterval(debouncResetSortingToDefaultInterval);
        }

        await setFilterTerm(value === " " ? "" : value);

        if (value === "" || value === " ") {
            if (debounce && getConfig(ConfigKey.DebounceDefaultSorting)) {
                setDebouncResetSortingToDefaultInterval(setTimeout(() => resetSorting(), getConfig(ConfigKey.SortingDebounceTime)));
            } else {
                resetSorting();
            }

            clearFilter();
        }
        else {
            setSpotifyVanillaPlaylistListVisible(false);
        }
    }

    const setSpotifyVanillaPlaylistListVisible = async (visible: boolean) => {
        if (!playlistContainer) {
            await setPlaylistContainer(document.querySelector("#spicetify-playlist-list"));
        }

        onFilter(visible);

        if (visible) {
            playlistContainer?.removeAttribute("style");
        } else {
            playlistContainer?.setAttribute("style", "display: none;");
        }
    }

    const clearFilter = async () => {
        if (filterState.sortOptionWithoutFiltering === SortOption.Custom) {
            setSpotifyVanillaPlaylistListVisible(true);
        } else {
            setSpotifyVanillaPlaylistListVisible(false);
        }

        setFilterTerm("");
    };

    const searchResults = useMemo(() => playlists.filter((playlist: (Playlist | Folder)) => {
        return playlist.name?.toLowerCase().includes(filterState.filterTerm.toLowerCase());
    })
        .sort((a, b) => sortItems(a, b, filterState.filterTerm, filterState.sortOption)), [filterState.filterTerm, filterState.sortOption]);


    const changeSortOption = async (option: SortOption) => setSortOption(option);

    const changeLibrarySortOption = async (option: SortOption) => {
        await setSortOptionWithoutFiltering(option);

        if (option === SortOption.Custom) {
            setSpotifyVanillaPlaylistListVisible(true);
        } else {
            setOpenLibraryFolders(getOpenFolderState() as string[]);
            setSpotifyVanillaPlaylistListVisible(false);
        }
    };

    const sortedLibrary = useMemo(() => library.sort((a, b) => sortItems(a, b, filterState.filterTerm, filterState.sortOptionWithoutFiltering)), [filterState.sortOptionWithoutFiltering]);

    const shouldDisplayFolders = (!isSortingWithoutFiltering
        && getConfig(ConfigKey.IncludeFoldersInResult)) ||
        (isSortingWithoutFiltering
            && !getConfig(ConfigKey.FlattenLibraryWhenSortingOtherThanCustom));

    return (
        <>
            <FilterContext.Provider value={filterState}>
                <div
                    id="playlist-filter-main-container"
                    className="main-navBar-navBarItem"
                    style={searchStyling}
                >
                    <style>
                        {
                            `
                                #playlist-filter-results::-webkit-scrollbar {
                                    width: 12px;
                                }
                            `
                        }
                    </style>
                    <input
                        id="playlist-filter-input"
                        style={searchInputStyling}
                        ref={searchInput}
                        placeholder="Filter"
                        value={filterTerm}
                        onChange={(e) => filterPlaylists(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Escape") {
                                clearFilter();
                                searchInput.current?.blur();
                            }
                        }}
                        onBlur={() => {
                            if (filterTerm.length === 0) {
                                resetSorting();
                            }
                        }}
                    />
                    {
                        !!filterTerm.length &&
                        (
                            <>
                                <div
                                    id="playlist-filter-clear-btn"
                                    style={clearButtonStyling}
                                    title="Clear filter"
                                    onClick={() => {
                                        resetSorting();
                                        clearFilter();
                                    }}
                                >
                                    <SpotifyIcon
                                        style={{ fill: "var(--text-subdued)" }}
                                        icon="x"
                                    />
                                </div>
                            </>
                        )
                    }

                    {
                        !!filterState.filterTerm.length
                            ? <SortOrderSelector onChange={changeSortOption} filtering={true} />
                            : <SortOrderSelector onChange={changeLibrarySortOption} filtering={false} />
                    }
                </div>

                {
                    (filterState.filterTerm || filterState.isSortingWithoutFiltering) &&
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
                            {(filterState.isSortingWithoutFiltering ? sortedLibrary : searchResults)
                                .map((item: any) => {
                                    if (item.type === "folder") {
                                        const isDeadEnd = folderIsDeadEnd(item, filterState.filterTerm);

                                        if (shouldDisplayFolders && shouldRenderFolder(item, filterState.filterTerm)) {
                                            return (
                                                <FolderItem
                                                    searchTerm={filterState.filterTerm}
                                                    folder={item}
                                                    key={item.uri}
                                                    deadEnd={getConfig(ConfigKey.HideUnrelatedInFolders) ? isDeadEnd : false}
                                                />
                                            );
                                        }
                                    } else {
                                        return (
                                            <PlaylistItem
                                                searchTerm={filterState.filterTerm}
                                                playlist={item}
                                                key={item.uri}
                                            />
                                        );
                                    }
                                })}
                        </ul>
                    </>
                }
            </FilterContext.Provider>
        </>
    );
});
