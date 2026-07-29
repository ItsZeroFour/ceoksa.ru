'use strict';

var icons = require('@strapi/icons');
var enums = require('../enums.js');

const FILE_TYPE_ICON_COMPONENT_MAP = {
    [enums.DocType.Pdf]: icons.FilePdf,
    [enums.DocType.Csv]: icons.FileCsv,
    [enums.DocType.Xls]: icons.FileXls,
    [enums.DocType.Zip]: icons.FileZip
};
const DEFAULT_FILE_ICON = icons.File;
const getFileIconComponent = (docType)=>{
    if (Object.values(enums.DocType).some((type)=>docType?.includes(type))) {
        return FILE_TYPE_ICON_COMPONENT_MAP[docType] ?? DEFAULT_FILE_ICON;
    }
    return DEFAULT_FILE_ICON;
};

exports.DEFAULT_FILE_ICON = DEFAULT_FILE_ICON;
exports.FILE_TYPE_ICON_COMPONENT_MAP = FILE_TYPE_ICON_COMPONENT_MAP;
exports.getFileIconComponent = getFileIconComponent;
//# sourceMappingURL=icons.js.map
