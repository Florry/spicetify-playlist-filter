import { SortOption } from "./constants";

export const SORT_LANG: Record<SortOption, string> = {
    [SortOption.Relevance]: "Sort by relevance",
    [SortOption.NameAsc]: "Sort by name (A-Z)",
    [SortOption.NameDesc]: "Sort by name (Z-A)",
    [SortOption.Custom]: "Custom sorting",
};