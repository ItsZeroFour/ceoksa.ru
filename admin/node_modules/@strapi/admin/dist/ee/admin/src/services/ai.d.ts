import { GetAiUsage } from '../../../../shared/contracts/ai';
declare const useGetAIUsageQuery: import("@reduxjs/toolkit/dist/query/react/buildHooks").UseQuery<import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("src").QueryArguments, unknown, import("src").BaseQueryError>, "GuidedTourMeta" | "HomepageKeyStatistics" | "AIUsage" | "AIFeatureConfig", GetAiUsage.Response, "adminApi">>, useGetAiTokenQuery: import("@reduxjs/toolkit/dist/query/react/buildHooks").UseQuery<import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("src").QueryArguments, unknown, import("src").BaseQueryError>, "GuidedTourMeta" | "HomepageKeyStatistics" | "AIUsage" | "AIFeatureConfig", {
    token: string;
    expiresAt?: string | undefined;
}, "adminApi">>, useLazyGetAiTokenQuery: import("@reduxjs/toolkit/dist/query/react/buildHooks").UseLazyQuery<import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("src").QueryArguments, unknown, import("src").BaseQueryError>, "GuidedTourMeta" | "HomepageKeyStatistics" | "AIUsage" | "AIFeatureConfig", {
    token: string;
    expiresAt?: string | undefined;
}, "adminApi">>, useGetAIFeatureConfigQuery: import("@reduxjs/toolkit/dist/query/react/buildHooks").UseQuery<import("@reduxjs/toolkit/query").QueryDefinition<void, import("@reduxjs/toolkit/query").BaseQueryFn<string | import("src").QueryArguments, unknown, import("src").BaseQueryError>, "GuidedTourMeta" | "HomepageKeyStatistics" | "AIUsage" | "AIFeatureConfig", {
    isAIi18nConfigured: boolean;
    isAIMediaLibraryConfigured: boolean;
}, "adminApi">>;
export { useGetAIUsageQuery, useGetAiTokenQuery, useLazyGetAiTokenQuery, useGetAIFeatureConfigQuery, };
