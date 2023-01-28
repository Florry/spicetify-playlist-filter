import React from "react";
import ReactDOM from "react-dom";
import ConfigContextProvider from "./components/ConfigContextProvider";
import { FilterInput } from "./components/FilterInput";
import { registerSubMenues } from "./menues/subMenues";

// TODO:
// - Clean up code, add some more memoization, etc
// - Add right click menu (figure out RadioStationProvider problem)

async function main() {
    const sidebarItem = await waitForSidebar();
    const div = document.createElement("div");

    /** To get scrolling in the filtered list working*/
    const onFilter = (searchCleared: boolean) => {
        if (searchCleared)
            div.removeAttribute("style");
        else
            div.setAttribute("style", "height: 100%; max-height: 100%;");
    };

    ReactDOM.render(
        <ConfigContextProvider>
            <FilterInput onFilter={onFilter} />
        </ConfigContextProvider>,
        div);

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