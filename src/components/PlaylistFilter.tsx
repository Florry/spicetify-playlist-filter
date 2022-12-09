import React, { useEffect, useMemo, useRef, useState } from "react";
import { SpotifyClient } from "../clients/SpotifyClient";
import { getConfig } from "../config/Config";
import { USE_KEYBOARD_SHORTCUTS } from "../constants/constants";
import { Playlist } from "../models/Playlist";
import { flattenLibrary } from "../utils/utils";
import { PlaylistItem } from "./PlaylistItem";
import { clearButtonStyling, searchInputStyling, searchStyling, ulStyling } from "./styling/PlaylistFilterStyling";

interface Props {
    onFilter: (searchCleared: boolean) => void;
}

export const SearchInput = (({ onFilter }: Props) => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
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
        if (getConfig(USE_KEYBOARD_SHORTCUTS)) {
            Spicetify.Keyboard.registerImportantShortcut("f", async () => {
                /* Without setImmediate here, the value of searchInput is set to f for some reason */
                setImmediate(() => {
                    if (searchInput.current)
                        searchInput.current.focus();
                });
            });
        }

        // Refreshes playlists every 30 min
        // TODO: find a better solution
        setInterval(() => getPlaylists(), 1000 * 30 * 60);
    }, []);

    const filterPlaylists = async (value: string) => {
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

    const searchResults = useMemo(() => playlists.filter(playlist => {
        return playlist.name?.toLowerCase().includes(searchTerm.toLowerCase());
    }), [searchTerm]);

    const sortedSearchResults = useMemo(() => searchResults.sort((a, b) => {
        const aMatch = a.name?.toLowerCase().indexOf(searchTerm.toLowerCase());
        const bMatch = b.name?.toLowerCase().indexOf(searchTerm.toLowerCase());

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
                            .map((playlist: any, i: number) => (
                                <PlaylistItem
                                    searchTerm={searchTerm}
                                    playlist={playlist}
                                    key={playlist.uri + i}
                                />
                            ))}
                    </ul>
                </>
            }
        </>
    );
});
