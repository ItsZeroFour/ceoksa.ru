import { AssetSource } from '../constants';
export declare const urlsToAssets: (urls: string[]) => Promise<{
    source: AssetSource;
    name: string;
    type: import("../enums").AssetType | import("../enums").DocType;
    url: string;
    ext: string | undefined;
    mime: string | undefined;
    rawFile: File;
}[]>;
