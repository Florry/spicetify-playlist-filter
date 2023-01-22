import { createContext, useContext } from "react";
import { FilterState, SortOption } from "../constants/constants";

const defaultState: FilterState = {
	currentlyPlayingUri: "",
	draggingSourceName: "",
	draggingSourceUri: "",
	filterTerm: "",
	isPlaying: false,
	isSortingWithoutFiltering: false,
	onDraggingDropped: () => { },
	openLibraryFolders: [],
	sortOptionWithoutFiltering: SortOption.Custom,
	sortOption: SortOption.Relevance,
};

export const FilterContext = createContext(defaultState);

export const useFilterContext = () => useContext(FilterContext);