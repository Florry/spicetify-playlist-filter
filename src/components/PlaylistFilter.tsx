import React, { useEffect, useRef, useState } from "react";
import { SpotifyClient } from "../clients/SpotifyClient";
import { getConfig } from "../config/Config";
import { USE_KEYBOARD_SHORTCUTS } from "../constants/constants";
import { Playlist } from "../models/Playlist";
import { flattenLibrary } from "../utils/utils";
import { PlaylistItem } from "./PlaylistItem";
import { clearButtonStyling, JUa6JJNj7R_Y3i4P8YUXStyling, mainRootlistContentStyling, osContentStyling, osPaddingStyling, osViewportStyling, searchInputStyling, searchStyling } from "./styling/PlaylistFilterStyling";

export const SearchInput = (() => {
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
		// TODO: find a better solution
		setInterval(() => getPlaylists(), 1000 * 30 * 60);
	}, []);

	const filterPlaylists = async (value: string) => {
		if (!playlistContainer)
			await setPlaylistContainer(document.querySelector("#spicetify-playlist-list"));

		await setSearchTerm(value === " " ? "" : value);

		if (value === "" || value === " ")
			playlistContainer?.removeAttribute("style");
		else
			playlistContainer?.setAttribute("style", "display: none;");
	}

	const clearFilter = async () => {
		await filterPlaylists(" ");
	};

	const searchResults = playlists.filter(playlist => {
		return playlist.name.toLowerCase().includes(searchTerm.toLowerCase());
	});

	const sortedSearchResults = searchResults.sort((a, b) => {
		const aMatch = a.name.toLowerCase().indexOf(searchTerm.toLowerCase());
		const bMatch = b.name.toLowerCase().indexOf(searchTerm.toLowerCase());

		// TODO: take into account the number of matches?

		if (aMatch > bMatch)
			return 1;
		else if (aMatch < bMatch)
			return -1;
		else
			return 0;
	});

	return (
		<>
			<div style={searchStyling}>
				<input
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

			<div className="main-rootlist-rootlistDividerContainer">
				<hr className="main-rootlist-rootlistDivider" />
				<div className="main-rootlist-rootlistDividerGradient" />
			</div>

			{
				searchTerm &&
				<div
					className="main-rootlist-rootlistContent"
					style={mainRootlistContentStyling}>
					<div
						className="os-padding"
						style={osPaddingStyling}
					>
						<div
							className="os-viewport os-viewport-native-scrollbars-invisible"
							style={osViewportStyling}
						>
							<div className="os-content"
								style={osContentStyling}>
								<ul>
									<div
										className="JUa6JJNj7R_Y3i4P8YUX"
										style={JUa6JJNj7R_Y3i4P8YUXStyling}
									>
										{sortedSearchResults
											.map((playlist: any) => (
												<PlaylistItem
													searchTerm={searchTerm}
													playlist={playlist}
													key={playlist.uri}
												/>
											))}
									</div>
								</ul>
							</div>
						</div>
					</div>
				</div>
			}
		</>
	);
});