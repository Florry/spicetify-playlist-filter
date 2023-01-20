export enum SortOption {
    Relevance = "relevance",
    NameAsc = "name-asc",
    NameDesc = "name-desc",
}

export type FilterState = {
    currentlyPlayingUri: string;
    draggingUri: string;
    searchQuery: string;
    sortOption: SortOption;
}