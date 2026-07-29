/// <reference types="koa" />
declare const _default: {
    locales: import("@strapi/types/dist/core").Controller;
    'iso-locales': import("@strapi/types/dist/core").Controller;
    'content-types': {
        getNonLocalizedAttributes(ctx: import("koa").Context): Promise<import("koa").Context | undefined>;
    };
    settings: {
        updateSettings(ctx: import("koa").Context): Promise<void>;
        getSettings(ctx: import("koa").Context): Promise<void>;
    };
    'ai-localization-jobs': ({ strapi }: {
        strapi: import("@strapi/types/dist/core").Strapi;
    }) => {
        getJobForSingleType(ctx: any): Promise<any>;
        getJobForCollectionType(ctx: any): Promise<any>;
    };
};
export default _default;
//# sourceMappingURL=index.d.ts.map