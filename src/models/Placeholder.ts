import { Item, ItemType } from "./Item";

export interface Placeholder extends Item {
    type: ItemType.Placeholder;
    isNotFound: boolean;
    isForbidden: boolean;
}

