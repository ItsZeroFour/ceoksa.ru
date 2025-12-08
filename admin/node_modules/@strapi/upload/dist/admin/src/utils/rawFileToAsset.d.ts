import { AssetSource } from '../constants';
import type { RawFile } from '../../../shared/contracts/files';
export declare const rawFileToAsset: (rawFile: RawFile, assetSource: AssetSource) => {
    size: number;
    createdAt: string;
    name: string;
    source: AssetSource;
    type: import("../enums").AssetType | import("../enums").DocType;
    url: string;
    ext: string | undefined;
    mime: string;
    rawFile: RawFile;
    isLocal: boolean;
};
