import { Image } from "./Image";

export interface Owner {
    type: string;
    uri: string;
    username: string;
    displayName: string;
    images: Image[];
}