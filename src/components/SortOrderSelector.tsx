import React, { useState } from "react";
import FilterIcon from "../assets/icons/FilterIcon";
import SpotifyIcon from "../assets/icons/SpotifyIcon";
import { SortOption } from "../constants/constants";
import { useFilterContext } from "../context/context";
import { clearButtonStyling } from "./styling/PlaylistFilterStyling";

interface Props {
    onChange: (option: SortOption) => void;
}

const menuOptions = [{
    label: "Sort by relevance",
    value: SortOption.Relevance
}, {
    label: "Sort by name (A-Z)",
    value: SortOption.NameAsc
}, {
    label: "Sort by name (Z-A)",
    value: SortOption.NameDesc
}
]

const SortOrderSelector = ({ onChange }: Props) => {
    const { sortOption } = useFilterContext();
    const [showSortMenu, setShowSortMenu] = useState(false);
    const toggleSortMenu = async () => setShowSortMenu(!showSortMenu);

    const setSortOption = (option: SortOption) => {
        onChange(option);
        toggleSortMenu();
    }

    return (
        <>
            <div
                id="playlist-filter-clear-btn"
                style={clearButtonStyling}
                title="Sorting"
                // onClick={toggleSortMenu}
                onMouseOver={() => setShowSortMenu(true)}
                onMouseLeave={() => setShowSortMenu(false)}
            >
                <FilterIcon />
                {
                    showSortMenu &&
                    (
                        <div
                            style={{
                                zIndex: "9999",
                                position: "absolute",
                                inset: "47px 54px auto auto",
                                margin: "0px",
                            }}
                        >
                            <div
                                id="context-menu"
                            >
                                <ul
                                    role="menu"
                                    data-depth="0"
                                    className="main-contextMenu-menu"
                                >
                                    {
                                        menuOptions.map((option) => (
                                            <li
                                                key={option.value}
                                                role="presentation"
                                                className="main-contextMenu-menuItem"
                                            >
                                                <button
                                                    className="main-contextMenu-menuItemButton"
                                                    role="menuitem"
                                                    onClick={() => setSortOption(option.value)}
                                                >
                                                    <div
                                                        dir="auto"
                                                        className="Type__TypeElement-sc-goli3j-0 hGXzYa ellipsis-one-line main-contextMenu-menuItemLabel"
                                                        data-encore-id="type"
                                                        style={{
                                                            display: "flex",
                                                            alignItems: "center",
                                                        }}
                                                    >
                                                        <div>{option.label}</div>
                                                        {option.value === sortOption && (
                                                            <div
                                                                style={{
                                                                    marginLeft: 7,
                                                                    marginTop: 7
                                                                }}
                                                            >
                                                                <SpotifyIcon icon="check" height="24px" width="24px" fill="" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            </li>
                                        ))
                                    }
                                </ul>
                            </div>
                        </div>
                    )
                }
            </div>
        </>
    );
};

export default SortOrderSelector;