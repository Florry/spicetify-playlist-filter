import React, { useState } from "react";
import SortIcon from "../assets/icons/SortIcon";
import SpotifyIcon from "../assets/icons/SpotifyIcon";
import { SortOption } from "../constants/constants";
import { SORT_LANG } from "../constants/language";
import { useFilterContext } from "../context/context";
import { clearButtonStyling } from "./styling/PlaylistFilterStyling";

type SortMenuOptions = {
    value: SortOption;
}[];

const filteringMenuOptions: SortMenuOptions = [
    { value: SortOption.Relevance },
    { value: SortOption.Custom },
    { value: SortOption.NameAsc },
    { value: SortOption.NameDesc },
    { value: SortOption.AddedDesc },
    { value: SortOption.AddedAsc }
];

const standardMenuOptions: SortMenuOptions = [
    { value: SortOption.Custom },
    { value: SortOption.NameAsc },
    { value: SortOption.NameDesc },
    { value: SortOption.AddedDesc },
    { value: SortOption.AddedAsc }
];

interface Props {
    onChange: (option: SortOption) => void;
    filtering: boolean;
}

const SortOrderSelector = ({ onChange, filtering }: Props) => {
    const { sortOption, librarySortOption: sortOptionWithoutFiltering } = useFilterContext();
    const [showSortMenu, setShowSortMenu] = useState(false);
    const toggleSortMenu = async () => setShowSortMenu(!showSortMenu);

    const setSortOption = (option: SortOption) => {
        onChange(option);
        toggleSortMenu();
    }

    return (
        <Spicetify.ReactComponent.TooltipWrapper label="Sorting" showDelay={100}>
            <div
                id="playlist-filter-clear-btn"
                style={clearButtonStyling}
                onMouseOver={() => setShowSortMenu(true)}
                onMouseLeave={() => setShowSortMenu(false)}
            >
                <SortIcon />
                {
                    showSortMenu &&
                    (
                        <div
                            style={{
                                zIndex: "9999",
                                position: "absolute",
                                inset: "37px 0px auto auto",
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
                                        (filtering ? filteringMenuOptions : standardMenuOptions).map((option) => (
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
                                                        <div
                                                            style={{ flex: 1, }}
                                                        >{SORT_LANG[option.value]}</div>

                                                        <div
                                                            style={{
                                                                marginLeft: 7,
                                                                marginTop: 7,
                                                                flex: 0,
                                                                opacity: (filtering ? option.value === sortOption : option.value === sortOptionWithoutFiltering) ? 1 : 0,
                                                            }}
                                                        >
                                                            <SpotifyIcon icon="check" height="24px" width="24px" fill="" />
                                                        </div>

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
        </Spicetify.ReactComponent.TooltipWrapper>
    );
};

export default SortOrderSelector;