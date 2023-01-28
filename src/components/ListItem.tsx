import React, { useMemo, useRef, useState } from "react";
import { ConfigKey, getConfig } from "../config/Config";
import { useConfigContext, useFilterContext } from "../context/context";
import { getNameWithHighlightedSearchTerm } from "../utils/utils";
import { listItemStyling, mainRootlistItemRootlistItemStyling } from "./styling/PlaylistItemStyling";

interface Props {
    onDrop: (e: React.DragEvent<any>) => void;
    onClick: (e: React.MouseEvent<any, MouseEvent>) => void;
    onDoubleClick: (e: React.MouseEvent<any, MouseEvent>) => void;
    name: string;
    href: string;
    imageComponent: React.ReactNode;
    isOwnedBySelf: boolean;
    indentation: number;
    children: React.ReactNode;
}

const ListItem = ({ onDrop, onClick, onDoubleClick, name, href, imageComponent, isOwnedBySelf, indentation, children }: Props) => {
    const { config } = useConfigContext();
    const { draggingSourceUri, filterTerm } = useFilterContext();
    const [dragDepth, setDragDepth] = useState(0);

    const outerRef = useRef<HTMLDivElement>(null);
    const listItemRef = useRef<HTMLLIElement>(null);

    const onDragEnter = (e: React.DragEvent<any>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!!draggingSourceUri.length && isOwnedBySelf) {
            setDragDepth(dragDepth => dragDepth + 1);
            outerRef.current?.classList.add("GlueDropTarget--active");
            listItemRef.current?.classList.add("xbsDt2_VfIDs0cQOXvgf");
        }
    };

    const onDragLeave = (e: React.DragEvent<any>) => {
        e.preventDefault();
        e.stopPropagation();

        if (!!draggingSourceUri.length) {
            const newDragDepth = Math.max(dragDepth - 1, 0);

            setDragDepth(newDragDepth);

            if (newDragDepth === 0) {
                outerRef.current?.classList.remove("GlueDropTarget--active");
                listItemRef.current?.classList.remove("xbsDt2_VfIDs0cQOXvgf");
            }
        } else {
            outerRef.current?.classList.remove("GlueDropTarget--active");
            listItemRef.current?.classList.remove("xbsDt2_VfIDs0cQOXvgf");
        }
    };

    const usePlaylistCovers = config[ConfigKey.UsePlaylistCovers];

    return (
        <>
            <div
                ref={outerRef}
                className={isOwnedBySelf ? `GlueDropTarget GlueDropTarget--albums GlueDropTarget--tracks GlueDropTarget--local-tracks GlueDropTarget--episodes GlueDropTarget--playlists GlueDropTarget--folders` : "GlueDropTarget GlueDropTarget--playlists GlueDropTarget--folders"}
                onDrop={(e) => {
                    onDrop(e);
                    onDragLeave(e);
                }}
                onDragEnter={onDragEnter}
                onDragLeave={onDragLeave}
            >
                <li
                    ref={listItemRef}
                    role="listitem" class={`main-rootlist-rootlistItem playlist-item`} draggable="true"
                    style={{
                        ...listItemStyling,
                        //  @ts-ignore
                        "--indentation": indentation
                    }}
                >
                    <div aria-hidden="true" className="main-rootlist-rootlistItemOverlay"></div>
                    <div
                        aria-current="page"
                        className="standalone-ellipsis-one-line main-rootlist-rootlistItemLink"
                        draggable="false"
                        style={mainRootlistItemRootlistItemStyling}
                    >
                        {usePlaylistCovers ? imageComponent : <></>}
                        <a
                            aria-current="page"
                            className="standalone-ellipsis-one-line main-rootlist-rootlistItemLink playlist-filter-results-playlist-link"
                            draggable="false"
                            href={href}
                            onClick={onClick}
                            onDoubleClick={onDoubleClick}
                        >
                            <span
                                className="Type__TypeElement-sc-goli3j-0 gkqrGP main-rootlist-textWrapper"
                                dir="auto"
                            >
                                <span dangerouslySetInnerHTML={{ __html: getNameWithHighlightedSearchTerm(name, filterTerm) }} />
                            </span>
                        </a>
                        {children}
                    </div>
                </li>
            </div>
        </>
    );
};

export default ListItem;