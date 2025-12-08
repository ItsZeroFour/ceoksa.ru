'use strict';

var enums = require('../enums.js');

const MIME_TYPE_MAP = {
    image: enums.AssetType.Image,
    video: enums.AssetType.Video,
    audio: enums.AssetType.Audio,
    pdf: enums.DocType.Pdf,
    csv: enums.DocType.Csv,
    // For XLS files the mime is application/vnd.ms-excel so we need to check for 'excel' not 'xls'
    excel: enums.DocType.Xls,
    zip: enums.DocType.Zip
};
const MIME_TYPE_KEYS = Object.keys(MIME_TYPE_MAP);
const typeFromMime = (mime)=>{
    const mimeTypeKey = MIME_TYPE_KEYS.find((m)=>mime.toLowerCase().includes(m));
    if (mimeTypeKey === undefined) return enums.AssetType.Document;
    return MIME_TYPE_MAP[mimeTypeKey] ?? enums.AssetType.Document;
};

exports.typeFromMime = typeFromMime;
//# sourceMappingURL=typeFromMime.js.map
