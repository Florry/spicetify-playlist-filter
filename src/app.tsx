import React from "react";
import ReactDOM from "react-dom";
import { SearchInput } from './components/PlaylistFilter';
import { registerSubMenues } from "./menues/subMenues";

async function main() {
	const sidebarItem = await waitForSidebar();
	const div = document.createElement("div");

	ReactDOM.render(<SearchInput />, div);

	sidebarItem.parentNode!.insertBefore(div, sidebarItem.nextSibling);

	console.log("YO");

	registerSubMenues();
}

export default main;

async function waitForSidebar() {
	const query = ".main-rootlist-rootlistDividerContainer";

	let playlistPanel = document.querySelector(query);

	while (!playlistPanel) {
		playlistPanel = document.querySelector(query);
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	return playlistPanel;
}