import { Item } from "./Item";

export interface Placeholder {
    type: Item.Placeholder;
    id: string;
    uid: string;
    uri: string;
    addedAt: string;
    isNotFound: boolean;
    isForbidden: boolean;
}

