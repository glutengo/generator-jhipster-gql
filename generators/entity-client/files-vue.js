const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const { replaceServiceProvider } = require('../../utils/vue');
const utils = require('../../utils/commons');


const vueFiles = [
    {
        templates: [
            {
                file: 'vue/entities/entity.gql.service.ts',
                renameTo: generator => `${jHipsterConstants.VUE_DIR}/entities/${generator.entityFolderName}/${generator.entityFileName}.gql.service.ts`
            },
        ]
    }
]

function adjustVueFiles(generator) {
    const tsProject = utils.getTsProject(generator);
    replaceServiceProvider(tsProject, generator.entityName);
}

module.exports = {
    vueFiles,
    adjustVueFiles
}
