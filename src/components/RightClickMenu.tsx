import React from "react";
import ReactDOM from "react-dom";
import { SpotifyClient } from "../clients/SpotifyClient";
import { LocaleKey } from "../constants/constants";
import { FilterContext, useFilterContext } from "../context/context";
import { getLocale } from "../utils/utils";

type MenuOption = {
    key: LocaleKey;
    onClick: () => void;
    dividerAfter?: boolean;
};

interface Props {
    children: React.ReactNode | ((openMenu: (e: React.MouseEvent) => void) => void);
    uri: string;
    playlistName: string;
    isOwnedBySelf: boolean;
    isFolder?: boolean;
}

const RightClickMenu = ({ children, uri, playlistName, isOwnedBySelf, isFolder }: Props) => {
    const filterContext = useFilterContext();

    const openMenu = (e: React.MouseEvent, handleContextMenu: (e: React.MouseEvent) => void) => {
        e.preventDefault();
        e.stopPropagation();

        handleContextMenu?.(e);

        setImmediate(() => {
            const rightClickMenuUls = document.querySelectorAll("[data-tippy-root] ul");

            if (rightClickMenuUls.length > 1) {
                rightClickMenuUls.forEach((ul, index) => {
                    if (index > 0) {
                        ul.remove();
                    }
                });
            }

            const rightClickMenuUl = rightClickMenuUls[0];

            const span = document.createElement("span");

            ReactDOM.render(
                <FilterContext.Provider value={filterContext}>
                    <Menu
                        closeMenu={() => handleContextMenu?.(e)}
                        event={e}
                        uri={uri}
                        position={{ x: e.clientX, y: e.clientY }}
                        isOwnedBySelf={isOwnedBySelf}
                        playlistName={playlistName}
                        isFolder={isFolder}
                    />
                </FilterContext.Provider>
                , span);

            if (isFolder) {
                rightClickMenuUl?.querySelector("li")?.remove();
            }

            rightClickMenuUl?.append(span);
        });
    };

    return (
        <Spicetify.ReactComponent.RightClickMenu
            menu={<Spicetify.ReactComponent.Menu uri={uri} />}
            children={
                (isOpen: boolean, handleContextMenu: any, _ref: any) => typeof children === "function" ? children((e) => !isOpen ? openMenu(e, handleContextMenu) : e.preventDefault()) : children
            }
        />
    );
};

export default RightClickMenu;

interface MenuProps {
    uri: string;
    position: { x: number; y: number };
    isOwnedBySelf: boolean;
    /** A bit of a hack */
    closeMenu: (e: React.MouseEvent) => void;
    event: React.MouseEvent;
    playlistName: string;
    isFolder?: boolean;
}

const Menu = ({ uri, position, isOwnedBySelf, closeMenu, event, playlistName, isFolder }: MenuProps) => {
    const { setRenamingUri, refreshLibrary } = useFilterContext();

    // options commented out are not essentials IMO
    const options: (MenuOption | undefined)[] = [
        !isFolder ? {
            key: LocaleKey.AddToQueue,
            onClick: () => console.log(LocaleKey.AddToQueue),
            dividerAfter: true
        } : undefined,
        // {
        //     key: LocaleKey.GoToPlaylistRadio,
        //     onClick: () => console.log(LocaleKey.GoToPlaylistRadio),
        //     dividerAfter: true
        // },
        // {
        //     key: LocaleKey.CollaborativePlaylist,
        //     onClick: () => console.log(LocaleKey.CollaborativePlaylist)
        // },
        // {
        //     key: LocaleKey.RemoveFromProfile,
        //     onClick: () => console.log(LocaleKey.RemoveFromProfile),
        //     dividerAfter: true
        // },
        // {
        //     key: LocaleKey.EditInformation,
        //     onClick: () => console.log(LocaleKey.EditInformation)
        // },
        // {
        //     key: LocaleKey.CreateSimilarPlaylist,
        //     onClick: () => console.log(LocaleKey.CreateSimilarPlaylist)
        // },
        isOwnedBySelf ? {
            key: LocaleKey.Delete,
            onClick: async () => {
                // TODO: proper modal
                // TODO: different text for folders
                const description = getLocale(LocaleKey.DeletePlaylistModalDescription).replace("{0}", playlistName).replace(/<b>|<\/b>/g, "");
                const remove = window.confirm(`${getLocale(LocaleKey.DeletePlaylistModalTitle)}\n\n${description}`);

                if (remove) {
                    await SpotifyClient.deletePlaylist(uri);
                    refreshLibrary();
                }
            }
        } : undefined,
        isOwnedBySelf ? {
            key: LocaleKey.Rename,
            onClick: () => setRenamingUri(uri),
            dividerAfter: true
        } : undefined,
        // {
        //     key: LocaleKey.Download,
        //     onClick: () => console.log(LocaleKey.Download),
        //     dividerAfter: true
        // },
        {
            key: LocaleKey.CreatePlaylist,
            onClick: async () => {
                await SpotifyClient.createPlaylist("New Playlist", uri);
                refreshLibrary();
            }
        },
        {
            key: LocaleKey.NewFolder,
            onClick: async () => {
                await SpotifyClient.createFolder("New Folder", uri);
                refreshLibrary();
            },
            dividerAfter: true
        },
        // {
        //     key: LocaleKey.Share,
        //     onClick: () => console.log(LocaleKey.Share)
        // },
        isFolder ? {
            key: LocaleKey.Play,
            onClick: () => console.log(LocaleKey.Play)
        } : undefined
    ];

    return <>
        {options
            .filter(option => !!option)
            .map((option) => (
                <li
                    key={option!.key}
                    role="presentation"
                    className="main-contextMenu-menuItem"
                    onClick={() => {
                        /* hack to close the menu */
                        closeMenu?.(event);
                        setImmediate(option!.onClick);
                        // close();
                    }}
                >
                    <button
                        className={`main-contextMenu-menuItemButton ${option!.dividerAfter ? "main-contextMenu-dividerAfter" : ""}`}
                        role="menuitem"
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
                            {getLocale(option!.key)}
                        </div>
                    </button>
                </li>
            ))}
    </>;
};