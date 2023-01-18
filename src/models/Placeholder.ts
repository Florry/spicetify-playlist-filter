import { ItemType } from "./Item";

export interface Placeholder {
    type: ItemType.Placeholder;
    isNotFound: boolean;
    isForbidden: boolean;
}

