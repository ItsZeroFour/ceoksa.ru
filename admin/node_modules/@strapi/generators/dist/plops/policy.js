'use strict';

var tsUtils = require('@strapi/typescript-utils');
var path = require('path');
var fs = require('fs');
var getDestinationPrompts = require('./prompts/get-destination-prompts.js');
var validateInput = require('./utils/validate-input.js');
var getFilePath = require('./utils/get-file-path.js');
var extendPluginIndexFiles = require('./utils/extend-plugin-index-files.js');

var generatePolicy = ((plop)=>{
    // Policy generator
    plop.setGenerator('policy', {
        description: 'Generate a policy for an API',
        prompts: [
            {
                type: 'input',
                name: 'id',
                message: 'Policy name',
                validate: (input)=>validateInput(input)
            },
            ...getDestinationPrompts('policy', plop.getDestBasePath(), {
                rootFolder: true
            })
        ],
        actions (answers) {
            if (!answers) {
                return [];
            }
            const currentDir = process.cwd();
            const filePath = getFilePath(answers.destination);
            let language = tsUtils.isUsingTypeScriptSync(currentDir) ? 'ts' : 'js';
            if (answers.plugin) {
                // The tsconfig in plugins is located just outside the server src, not in the root of the plugin.
                const pluginServerDir = path.join(currentDir, 'src', filePath.replace('{{ plugin }}', answers.plugin), '../');
                language = tsUtils.isUsingTypeScriptSync(pluginServerDir) ? 'ts' : 'js';
            }
            const baseActions = [
                {
                    type: 'add',
                    path: `${filePath}/policies/{{ id }}.${language}`,
                    templateFile: `templates/${language}/policy.${language}.hbs`
                }
            ];
            if (answers.plugin) {
                const indexPath = path.join(plop.getDestBasePath(), `${filePath}/policies/index.${language}`);
                const exists = fs.existsSync(indexPath);
                if (!exists) {
                    // Create index file if it doesn't exist
                    baseActions.push({
                        type: 'add',
                        path: `${filePath}/policies/index.${language}`,
                        templateFile: `templates/${language}/plugin/plugin.index.${language}.hbs`,
                        skipIfExists: true
                    });
                }
                // Append the new policy to the index.ts file
                baseActions.push({
                    type: 'modify',
                    path: `${filePath}/policies/index.${language}`,
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

module.exports = generatePolicy;
//# sourceMappingURL=policy.js.map
