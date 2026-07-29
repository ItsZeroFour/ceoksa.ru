import controller from './locales.mjs';
import controller$2 from './content-types.mjs';
import controller$1 from './iso-locales.mjs';
import settings from './settings.mjs';
import createAILocalizationJobsController from './ai-localization-jobs.mjs';

var controllers = {
    locales: controller,
    'iso-locales': controller$1,
    'content-types': controller$2,
    settings,
    'ai-localization-jobs': createAILocalizationJobsController
};

export { controllers as default };
//# sourceMappingURL=index.mjs.map
