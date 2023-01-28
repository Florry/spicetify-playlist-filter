import React, { useEffect, useMemo, useRef, useState } from "react";
import SpotifyIcon from "../assets/icons/SpotifyIcon";
import { SpotifyClient } from "../clients/SpotifyClient";
import { ConfigKey } from "../config/Config";
import { FilterState, SortOption } from "../constants/constants";
import { FilterContext, useConfigContext } from "../context/context";
import { Folder } from "../models/Folder";
import { Playlist } from "../models/Playlist";
import { flattenLibrary as flattenLibraryUtil, getConfiguredKeyboardKeys, getOpenFolderState, sanitizeLibrary, sortItems } from "../utils/utils";
import DebugPanel from "./DebugPanel";
import FolderItem, { folderIsDeadEnd, shouldRenderFolder } from "./FolderItem";
import { PlaylistItem } from "./PlaylistItem";
import SortOrderSelector from "./SortOrderSelector";
import { clearButtonStyling, searchInputStyling, searchStyling, ulStyling } from "./styling/PlaylistFilterStyling";

let searchInputElement: HTMLInputElement | null = null;
let focusInputField: () => void;

/** Hack to be able to get config context in decoupled components, e.g. ConfigModal which is rendered on its own */
export let mainConfigContext: any;

// TODO: this file has become a mess, clean it up
// TODO: ConfigContext should be used instead of getConfig so that changes to config are reflected immediately

export function registerKeyboardShortcut() {
    Spicetify.Keyboard.registerImportantShortcut(getConfiguredKeyboardKeys(), () => focusInputField());
}

interface Props {
    onFilter: (searchCleared: boolean) => void;
}

export const FilterInput = (({ onFilter }: Props) => {
    const configContext = useConfigContext();
    const { config } = configContext;

    mainConfigContext = configContext

    const [playlists, setPlaylists] = useState<(Playlist | Folder)[]>([]);
    const [library, setLibrary] = useState<(Playlist | Folder)[]>([]);
    const [filterTerm, setFilterTerm] = useState<string>("");
    const [currentlyPlayingUri, setCurrentlyPlayingUri] = useState<string>("");
    const [draggingSourceUri, setDraggingSourceUri] = useState<string>("");
    const [draggingSourceName, setDraggingSourceName] = useState<string>("");
    const [sortOption, setSortOption] = useState<SortOption>(config[ConfigKey.DefaultSorting]);
    const [librarySortOption, setLibrarySortOption] = useState<SortOption>(SortOption.Custom);
    const [isSortingLibrary, setIsSortingLibrary] = useState<boolean>(false);
    const [openLibraryFolders, setOpenLibraryFolders] = useState<string[]>([]);
    const [flattenLibrary, setFlattenLibrary] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [renamingUri, setRenamingUri] = useState("");
    const [refreshLibrary, setRefreshLibrary] = useState(false);

    const filterState: FilterState = {
        library,
        playlists,

        filterTerm,

        currentlyPlayingUri,

        draggingSourceUri,
        draggingSourceName,

        sortOption,
        librarySortOption,
        isSortingLibrary,
        openLibraryFolders,
        flattenLibrary,

        isPlaying,
        renamingUri,

        setRenamingUri: setRenamingUri,
        onDraggingDropped: () => {
            setDraggingSourceUri("");
            setDraggingSourceName("");
        },
        refreshLibrary: () => setRefreshLibrary(true),
    };

    const [filterInputIsFocused, setFilterInputIsFocused] = useState(false);

    const focusFilterInput = () => {
        /* Without setImmediate here, the value of searchInput is set to f for some reason */
        setImmediate(() => {
            if (searchInputElement)
                searchInputElement.focus();
        });

        setFilterInputIsFocused(true);
    }

    focusInputField = focusFilterInput;

    useEffect(() => {
        if (!filterTerm.length && librarySortOption !== SortOption.Custom || !filterTerm.length && flattenLibrary) {
            setIsSortingLibrary(true);
        } else {
            setIsSortingLibrary(false);
        }
    }, [filterTerm, librarySortOption, flattenLibrary]);


    const [playlistContainer, setPlaylistContainer] = useState(document.querySelector("#spicetify-playlist-list"));

    const loadAndPrepareLibrary = async () => {
        console.log("loadAndPrepareLibrary");
        const library = await SpotifyClient.getLibrary();
        const playlists = flattenLibraryUtil(library);

        setPlaylists(playlists);

        if (config[ConfigKey.FlattenLibraryWhenSortingOtherThanCustom] || flattenLibrary) {
            setLibrary(playlists);
        } else {
            setLibrary(sanitizeLibrary(library));
        }

        if (config[ConfigKey.UsePlaylistCovers]) {
            SpotifyClient.getPlaylistImages();
        }
    };

    useEffect(() => {
        if (config[ConfigKey.UsePlaylistCovers] && !!filterTerm.length) {
            SpotifyClient.getPlaylistImages();
        }
    }, [config[ConfigKey.UsePlaylistCovers]]);

    useEffect(() => {
        if (refreshLibrary) {
            /** Spotify's backend needs some time to process changes to the library it seems, e.g. it returns removed playlist if fetched right after remove request is successful🤔 */
            setTimeout(loadAndPrepareLibrary, 700);
            setRefreshLibrary(false);
        }
    }, [refreshLibrary]);

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
        loadAndPrepareLibrary();

        if (config[ConfigKey.UseKeyboardShortcuts]) {
            /* A bit of a hack to be able to register/deregister shortcuts from config, but it will do */
            searchInputElement = searchInput.current;
            registerKeyboardShortcut();
        }

        const playlistRefreshIntervalConfig = config[ConfigKey.PlaylistListRefreshInterval];

        let getPlaylistsInterval: NodeJS.Timeout;

        if (playlistRefreshIntervalConfig > 0) {
            getPlaylistsInterval = setInterval(() => loadAndPrepareLibrary(), playlistRefreshIntervalConfig);
        }

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

    const resetSorting = () => setSortOption(config[ConfigKey.DefaultSorting]);

    const [debouncResetSortingToDefaultInterval, setDebouncResetSortingToDefaultInterval] = useState<NodeJS.Timeout | null>(null);

    const filterPlaylists = async (value: string, debounce: boolean = true) => {
        if (debouncResetSortingToDefaultInterval) {
            clearInterval(debouncResetSortingToDefaultInterval);
        }

        await setFilterTerm(value === " " ? "" : value);

        if (!!value.length && !filterTerm.length) {
            loadAndPrepareLibrary();
        }

        if (value === "" || value === " ") {
            if (debounce && config[ConfigKey.DebounceDefaultSorting]) {
                setDebouncResetSortingToDefaultInterval(setTimeout(() => resetSorting(), config[ConfigKey.SortingDebounceTime]));
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
        setFilterInputIsFocused(false);

        if (librarySortOption === SortOption.Custom) {
            setSpotifyVanillaPlaylistListVisible(true);
        } else {
            setSpotifyVanillaPlaylistListVisible(false);
        }

        setFilterTerm("");
    };

    const searchResults = useMemo(() => playlists.filter((item: (Playlist | Folder)) => {
        // TODO: sanitize input to prevent regex crashes
        if (filterTerm.includes(".*")) { // Regex light
            const regex = new RegExp(filterTerm, "i");
            return !item.removed && item.name?.toLowerCase().match(regex);
        }

        return !item.removed && item.name?.toLowerCase().includes(filterTerm.toLowerCase());
    })
        .sort((a, b) => sortItems(a, b, filterTerm, sortOption)), [filterTerm, sortOption, playlists]);


    const changeSortOption = async (option: SortOption) => setSortOption(option);

    const changeLibrarySortOption = async (option: SortOption) => {
        const librarySortOptionBefore = librarySortOption;

        await setLibrarySortOption(option);

        if (option === SortOption.Custom && !flattenLibrary) {
            setSpotifyVanillaPlaylistListVisible(true);
        } else {
            if (librarySortOptionBefore === SortOption.Custom) {
                loadAndPrepareLibrary();
            }

            setOpenLibraryFolders(getOpenFolderState() as string[]);
            setSpotifyVanillaPlaylistListVisible(false);
        }
    };

    const changeFlattenLibraryOption = async (option: boolean) => {
        await setFlattenLibrary(option);

        if (option) {
            setSpotifyVanillaPlaylistListVisible(false);
            setOpenLibraryFolders(getOpenFolderState() as string[]);
            setSpotifyVanillaPlaylistListVisible(false);
            loadAndPrepareLibrary();
        } else {
            setSpotifyVanillaPlaylistListVisible(true);
        }
    }

    const sortedLibrary = useMemo(() => (flattenLibrary ? playlists : library)
        .filter((item: (Playlist | Folder)) => !item.removed)
        .sort((a, b) => sortItems(a, b, filterTerm, librarySortOption)), [librarySortOption, library, flattenLibrary]);

    const shouldDisplayFolders = !flattenLibrary && ((!isSortingLibrary
        && config[ConfigKey.IncludeFoldersInResult]) ||
        (isSortingLibrary
            && !config[ConfigKey.FlattenLibraryWhenSortingOtherThanCustom]));

    const shouldDisplaySorting = config[ConfigKey.UseSortingForFilteringOnly] && config[ConfigKey.UseSorting] ? !!filterTerm.length : config[ConfigKey.UseSorting];
    const shouldDisplayFlattenLibrary = config[ConfigKey.UseFlattenLibraryForFilteringOnly] && config[ConfigKey.UseFlattenLibrary] ? !!filterTerm.length : config[ConfigKey.UseFlattenLibrary];

    return (
        <>
            <FilterContext.Provider value={filterState}>
                {/* <DebugPanel /> */}
                <div
                    id="playlist-filter-main-container"
                    className="main-navBar-navBarItem"
                >
                    <div
                        style={{
                            ...searchStyling,
                            ...(config[ConfigKey.HideFilteringWhenNotInUse] && !filterInputIsFocused && !filterTerm.length ? {
                                position: "absolute",
                                transition: "all 10s ease",
                                top: -1000
                            } : {}),
                        }}
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
                                    setFilterInputIsFocused(false);
                                }
                            }}
                            onBlur={() => {
                                if (filterTerm.length === 0) {
                                    resetSorting();
                                    setTimeout(() => setFilterInputIsFocused(false), 100);
                                }
                            }}
                        />
                        {
                            !!filterTerm.length &&
                            (
                                <Spicetify.ReactComponent.TooltipWrapper label="Clear filter" showDelay={100}>
                                    <div
                                        id="playlist-filter-clear-btn"
                                        style={clearButtonStyling}
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
                                </Spicetify.ReactComponent.TooltipWrapper>
                            )
                        }

                        {
                            shouldDisplayFlattenLibrary ?
                                <Spicetify.ReactComponent.TooltipWrapper label="Flatten library" showDelay={100}>
                                    <div
                                        id="playlist-filter-clear-btn"
                                        style={clearButtonStyling}
                                        onClick={() => changeFlattenLibraryOption(!flattenLibrary)}
                                    >
                                        <SpotifyIcon
                                            style={{ fill: flattenLibrary ? "var(--spice-button-active)" : "var(--text-subdued)" }}
                                            icon="library"
                                        />
                                    </div>
                                </Spicetify.ReactComponent.TooltipWrapper>
                                : <></>
                        }

                        {
                            shouldDisplaySorting ?
                                !!filterTerm.length
                                    ? <SortOrderSelector onChange={changeSortOption} filtering={true} />
                                    : <SortOrderSelector onChange={changeLibrarySortOption} filtering={false} />
                                : <></>
                        }
                    </div>
                </div>

                {
                    (filterTerm || isSortingLibrary || flattenLibrary) &&
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
                            {/* {((isSortingLibrary || flattenLibrary) ? sortedLibrary : searchResults) */}
                            {(!isSortingLibrary || (!isSortingLibrary && flattenLibrary) ? searchResults : sortedLibrary)
                                .map((item: any) => {
                                    if (item.type === "folder") {
                                        const isDeadEnd = folderIsDeadEnd(item, filterTerm);

                                        if (shouldDisplayFolders && shouldRenderFolder(item, filterTerm, config)) {
                                            return (
                                                <FolderItem
                                                    searchTerm={filterTerm}
                                                    folder={item}
                                                    key={item.uri}
                                                    deadEnd={config[ConfigKey.HideUnrelatedInFolders] ? isDeadEnd : false}
                                                />
                                            );
                                        }
                                    } else {
                                        return (
                                            <PlaylistItem
                                                searchTerm={filterTerm}
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
