export enum SortOption {
    Relevance = "relevance",
    NameAsc = "name-asc",
    NameDesc = "name-desc",
    Custom = "custom",
}

export type FilterState = {
    filterTerm: string;
    currentlyPlayingUri: string;
    draggingUri: string;
    draggingTarget: string;
    sortOption: SortOption;
    sortOptionWithoutFiltering: SortOption;
    isSortingWithoutFiltering: boolean;
    openLibraryFolders: string[];
    isPlaying: boolean;
}