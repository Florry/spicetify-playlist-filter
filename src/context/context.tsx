import { createContext, useContext } from "react";
import { FilterState, SortOption } from "../constants/constants";

const defaultState: FilterState = {
	currentlyPlayingUri: "",
	draggingSourceName: "",
	draggingSourceUri: "",
	filterTerm: "",
	isPlaying: false,
	isSortingLibrary: false,
	onDraggingDropped: () => { },
	openLibraryFolders: [],
	librarySortOption: SortOption.Custom,
	sortOption: SortOption.Relevance,
};

export const FilterContext = createContext(defaultState);

export const useFilterContext = () => useContext(FilterContext);