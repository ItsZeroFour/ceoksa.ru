'use strict';

var api = require('../../../../admin/src/services/api.js');

const aiService = api.adminApi.injectEndpoints({
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

exports.useGetAIFeatureConfigQuery = useGetAIFeatureConfigQuery;
exports.useGetAIUsageQuery = useGetAIUsageQuery;
exports.useGetAiTokenQuery = useGetAiTokenQuery;
exports.useLazyGetAiTokenQuery = useLazyGetAiTokenQuery;
//# sourceMappingURL=ai.js.map
