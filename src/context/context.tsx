import { createContext, useContext } from "react";
import { FilterState, SortOption } from "../constants/constants";

const defaultState: FilterState = {
	currentlyPlayingUri: "",
	draggingUri: "",
	searchQuery: "",
	sortOption: SortOption.Relevance,
};

export const FilterContext = createContext(defaultState);

export const useFilterContext = () => useContext(FilterContext);