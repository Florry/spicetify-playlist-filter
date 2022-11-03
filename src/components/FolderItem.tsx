import React, { useMemo } from "react";
import { Folder } from "../models/Folder";
import { flattenLibrary, getNameWithHighlightedSearchTerm } from "../utils/utils";
import { PlaylistItem } from "./PlaylistItem";

interface Props {
	searchTerm: string;
	folder: Folder;
	indentation?: number;
}

const TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS = true;

const FolderItem = ({ searchTerm, folder, indentation = 0 }: Props) => {
	const [folderIsOpen, setFolderIsOpen] = React.useState(false);

	// TODO:
	const goToFolder = (e: React.MouseEvent<any>) => {
		e.preventDefault();

		const href = Spicetify.URI.from(folder.uri)?.toURLPath(true)

		if (href) {
			Spicetify.Platform.History.push(href);
		}
	};

	const toggleFolderOpen = (e: React.MouseEvent<any>) => {
		console.log(flattenLibrary(folder.items));
		e.preventDefault();

		if (folderIsOpen) {
			setFolderIsOpen(false);
		} else {
			setFolderIsOpen(true);
		}
	}

	return (
		<>
			<li
				role="listitem"
				class="main-rootlist-rootlistItem playlist-item"
				draggable="true"
				style={{
					// @ts-ignore
					"--indentation": indentation
				}}
				aria-expanded="false"
				onClick={goToFolder}
			>
				<div
					aria-hidden="true"
					className="main-rootlist-rootlistItemOverlay"
				/>

				<a
					className="standalone-ellipsis-one-line main-rootlist-rootlistItemLink"
					draggable="false"
					// @ts-ignore
					tabindex="-1"
					href="/folder/e9c10fbbe64c2a96"
				>
					<span
						className="Type__TypeElement-goli3j-0 gJFKvJ main-rootlist-textWrapper"
						dir="auto"
					>
						<span dangerouslySetInnerHTML={{ __html: getNameWithHighlightedSearchTerm(folder.name, searchTerm) }} />
					</span>
				</a>

				<button
					// @ts-ignore
					tabindex="-1"
					className="Button-sc-1dqy6lx-0 dmmeCL main-rootlist-expandArrow main-rootlist-expandArrowActive"
					aria-label="Expand folder"
					onClick={toggleFolderOpen}
				>
					<span
						aria-hidden="true"
						className="IconWrapper__Wrapper-sc-16usrgb-0 bxwPwV"
						style={{
							transform: folderIsOpen ? "rotate(90deg)" : "rotate(0deg)"
						}}
					>
						<svg
							role="img"
							height="16"
							width="16"
							viewBox="0 0 16 16"
							className="Svg-ytk21e-0 jAKAlG"
						>
							<path
								d="M14 6l-6 6-6-6h12z"
							/>
						</svg>
					</span>
				</button>
			</li>

			{
				folderIsOpen &&
				folder.items.map((item, i) => {
					if (item.type === "folder") {
						if (!TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS || TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS) {
							return (
								<FolderItem
									searchTerm={searchTerm}
									folder={item}
									key={item.uri + i}
									indentation={indentation + 1}
								/>
							);
						}
					} else {
						if (!TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS || TEMP_CONFIG_HIDE_UNRELATED_IN_FOLDERS && item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
							return (
								<PlaylistItem
									searchTerm={searchTerm}
									playlist={item}
									key={item.uri + i}
									indentation={indentation - 0.5}
								/>
							)
						}
					}
				})
			}

		</>
	);
};

export default FolderItem;