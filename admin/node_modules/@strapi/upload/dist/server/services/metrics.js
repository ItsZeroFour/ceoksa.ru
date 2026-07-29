'use strict';

const getProviderName = ()=>strapi.config.get('plugin::upload.provider', 'local');
const isProviderPrivate = async ()=>strapi.plugin('upload').provider.isPrivate();
var metrics = (({ strapi: strapi1 })=>({
        async trackUsage (event, properties) {
            const settings = await strapi1.plugin('upload').service('upload').getSettings();
            const isAIAvailable = strapi1.config.get('admin.ai.enabled', true) && strapi1.ee.features.isEnabled('cms-ai');
            return strapi1.telemetry.send(event, {
                ...properties,
                eventProperties: {
                    ...properties?.eventProperties,
                    ...isAIAvailable ? {
                        isAIMediaLibraryConfigured: Boolean(settings.aiMetadata)
                    } : {}
                }
            });
        },
        async sendUploadPluginMetrics () {
            const uploadProvider = getProviderName();
            const privateProvider = await isProviderPrivate();
            await this.trackUsage('didInitializePluginUpload', {
                groupProperties: {
                    uploadProvider,
                    privateProvider
                }
            });
        }
    }));

module.exports = metrics;
//# sourceMappingURL=metrics.js.map
