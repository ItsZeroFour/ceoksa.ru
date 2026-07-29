'use strict';

var tsUtils = require('@strapi/typescript-utils');
var path = require('path');
var fs = require('fs');
var getDestinationPrompts = require('./prompts/get-destination-prompts.js');
var getFilePath = require('./utils/get-file-path.js');
var validateInput = require('./utils/validate-input.js');
var extendPluginIndexFiles = require('./utils/extend-plugin-index-files.js');

var generateController = ((plop)=>{
    // Controller generator
    plop.setGenerator('controller', {
        description: 'Generate a controller for an API',
        prompts: [
            {
                type: 'input',
                name: 'id',
                message: 'Controller name',
                validate: (input)=>validateInput(input)
            },
            ...getDestinationPrompts('controller', plop.getDestBasePath())
        ],
        actions (answers) {
            if (!answers) {
                return [];
            }
            const filePath = getFilePath(answers.destination);
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
                    path: `${filePath}/controllers/{{ id }}.${language}`,
                    templateFile: `templates/${language}/controller.${language}.hbs`
                }
            ];
            if (answers.plugin) {
                const indexPath = path.join(plop.getDestBasePath(), `${filePath}/controllers/index.${language}`);
                const exists = fs.existsSync(indexPath);
                if (!exists) {
                    // Create index file if it doesn't exist
                    baseActions.push({
                        type: 'add',
                        path: `${filePath}/controllers/index.${language}`,
                        templateFile: `templates/${language}/plugin/plugin.index.${language}.hbs`,
                        skipIfExists: true
                    });
                }
                // Append the new controller to the index.ts file
                baseActions.push({
                    type: 'modify',
                    path: `${filePath}/controllers/index.${language}`,
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

module.exports = generateController;
//# sourceMappingURL=controller.js.map
