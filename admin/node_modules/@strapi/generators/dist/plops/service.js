'use strict';

var tsUtils = require('@strapi/typescript-utils');
var path = require('path');
var fs = require('fs');
var getDestinationPrompts = require('./prompts/get-destination-prompts.js');
var getFilePath = require('./utils/get-file-path.js');
var extendPluginIndexFiles = require('./utils/extend-plugin-index-files.js');

var generateService = ((plop)=>{
    // Service generator
    plop.setGenerator('service', {
        description: 'Generate a service for an API',
        prompts: [
            {
                type: 'input',
                name: 'id',
                message: 'Service name'
            },
            ...getDestinationPrompts('service', plop.getDestBasePath())
        ],
        actions (answers) {
            if (!answers) {
                return [];
            }
            const filePath = getFilePath(answers?.destination);
            const currentDir = process.cwd();
            let language = tsUtils.isUsingTypeScriptSync(currentDir) ? 'ts' : 'js';
            if (answers.plugin) {
                // The tsconfig in plugins is located just outside the server src, not in the root of the plugin.
                const pluginServerDir = path.join(currentDir, 'src', filePath.replace('{{ plugin }}', answers.plugin), '../');
                language = tsUtils.isUsingTypeScriptSync(pluginServerDir) ? 'ts' : 'js';
            }
            const baseActions = [
                {
                    type: 'add',
                    path: `${filePath}/services/{{ id }}.${language}`,
                    templateFile: `templates/${language}/service.${language}.hbs`
                }
            ];
            if (answers.plugin) {
                const indexPath = path.join(plop.getDestBasePath(), `${filePath}/services/index.${language}`);
                const exists = fs.existsSync(indexPath);
                if (!exists) {
                    // Create index file if it doesn't exist
                    baseActions.push({
                        type: 'add',
                        path: `${filePath}/services/index.${language}`,
                        templateFile: `templates/${language}/plugin/plugin.index.${language}.hbs`,
                        skipIfExists: true
                    });
                }
                // Append the new service to the index.ts file
                baseActions.push({
                    type: 'modify',
                    path: `${filePath}/services/index.${language}`,
                    transform (template) {
                        return extendPluginIndexFiles.appendToFile(template, {
                            type: 'index',
                            singularName: answers.id
                        });
                    }
                });
            }
            return baseActions;
        }
    });
});

module.exports = generateService;
//# sourceMappingURL=service.js.map
