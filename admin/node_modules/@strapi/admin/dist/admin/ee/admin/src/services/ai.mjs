import { adminApi } from '../../../../admin/src/services/api.mjs';

const aiService = adminApi.injectEndpoints({
    endpoints: (builder)=>({
            getAIUsage: builder.query({
                query: ()=>({
                        method: 'GET',
                        url: `/admin/ai-usage`
                    }),
                providesTags: [
                    'AIUsage'
                ]
            }),
            getAiToken: builder.query({
                query: ()=>({
                        method: 'GET',
                        url: '/admin/ai-token'
                    }),
                transformResponse (res) {
                    return res.data;
                }
            }),
            getAIFeatureConfig: builder.query({
                query: ()=>({
                        method: 'GET',
                        url: '/admin/ai-feature-config'
                    }),
                transformResponse (res) {
                    return res.data;
                },
                providesTags: [
                    'AIFeatureConfig'
                ]
            })
        }),
    overrideExisting: true
});
const { useGetAIUsageQuery, useGetAiTokenQuery, useLazyGetAiTokenQuery, useGetAIFeatureConfigQuery } = aiService;

export { useGetAIFeatureConfigQuery, useGetAIUsageQuery, useGetAiTokenQuery, useLazyGetAiTokenQuery };
//# sourceMappingURL=ai.mjs.map
