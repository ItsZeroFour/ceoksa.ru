import { FilePdf, FileCsv, FileXls, FileZip, File } from '@strapi/icons';
import { DocType } from '../enums.mjs';

const FILE_TYPE_ICON_COMPONENT_MAP = {
    [DocType.Pdf]: FilePdf,
    [DocType.Csv]: FileCsv,
    [DocType.Xls]: FileXls,
    [DocType.Zip]: FileZip
};
const DEFAULT_FILE_ICON = File;
const getFileIconComponent = (docType)=>{
    if (Object.values(DocType).some((type)=>docType?.includes(type))) {
        return FILE_TYPE_ICON_COMPONENT_MAP[docType] ?? DEFAULT_FILE_ICON;
    }
    return DEFAULT_FILE_ICON;
};

export { DEFAULT_FILE_ICON, FILE_TYPE_ICON_COMPONENT_MAP, getFileIconComponent };
//# sourceMappingURL=icons.mjs.map
