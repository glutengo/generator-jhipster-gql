const jHipsterConstants = require('generator-jhipster/generators/generator-constants');

const vueFiles = [
    {
        templates: [
            {
                file: 'vue/entities/entity.gql.service.ts',
                renameTo: generator =>
                    `${jHipsterConstants.VUE_DIR}/entities/${generator.entityFolderName}/${generator.entityFileName}.gql.service.ts`
            }
        ]
    }
];

module.exports = {
    vueFiles
};
