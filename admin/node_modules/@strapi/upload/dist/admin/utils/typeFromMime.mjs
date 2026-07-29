import { AssetType, DocType } from '../enums.mjs';

const MIME_TYPE_MAP = {
    image: AssetType.Image,
    video: AssetType.Video,
    audio: AssetType.Audio,
    pdf: DocType.Pdf,
    csv: DocType.Csv,
    // For XLS files the mime is application/vnd.ms-excel so we need to check for 'excel' not 'xls'
    excel: DocType.Xls,
    zip: DocType.Zip
};
const MIME_TYPE_KEYS = Object.keys(MIME_TYPE_MAP);
const typeFromMime = (mime)=>{
    const mimeTypeKey = MIME_TYPE_KEYS.find((m)=>mime.toLowerCase().includes(m));
    if (mimeTypeKey === undefined) return AssetType.Document;
    return MIME_TYPE_MAP[mimeTypeKey] ?? AssetType.Document;
};

export { typeFromMime };
//# sourceMappingURL=typeFromMime.mjs.map
