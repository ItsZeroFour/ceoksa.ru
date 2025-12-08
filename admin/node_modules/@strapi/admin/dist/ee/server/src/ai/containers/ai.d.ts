import type { Core } from '@strapi/types';
declare const createAIContainer: ({ strapi }: {
    strapi: Core.Strapi;
}) => {
    getAIFeatureConfig: () => Promise<{
        isAIi18nConfigured: boolean;
        isAIMediaLibraryConfigured: boolean;
    }>;
    getAiToken: () => Promise<{
        token: string;
        expiresAt: string | undefined;
    }>;
};
export { createAIContainer };
//# sourceMappingURL=ai.d.ts.map