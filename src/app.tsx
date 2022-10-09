import React from "react";
import ReactDOM from "react-dom";
import { SearchInput } from "./components/PlaylistFilter";
import { registerSubMenues } from "./menues/subMenues";

async function main() {
    const sidebarItem = await waitForSidebar();
    const div = document.createElement("div");

    /** To get scrolling in the filtered list working*/
    const onFilter = (searchCleared: boolean) => {
        if (searchCleared)
            div.removeAttribute("style");
        else
            div.setAttribute("style", "height: 100vh; max-height: 100%;");
    };

    ReactDOM.render(<SearchInput onFilter={onFilter} />, div);

    sidebarItem.parentNode!.insertBefore(div, sidebarItem);

    registerSubMenues();
}

export default main;

async function waitForSidebar() {
    const query = ".main-rootlist-rootlistContent";

    let playlistPanel = document.querySelector(query);

    while (!playlistPanel) {
        playlistPanel = document.querySelector(query);
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return playlistPanel;
}