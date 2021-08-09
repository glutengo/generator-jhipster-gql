const jHipsterConstants = require('generator-jhipster/generators/generator-constants');

const angularFiles = [
    {
        templates: [
            {
                file: 'angular/entities/service/entity.gql.service.ts',
                renameTo: generator =>
                    `${jHipsterConstants.ANGULAR_DIR}/entities/${generator.entityFolderName}/service/${generator.entityFileName}.gql.service.ts`
            }
        ]
    }
];

module.exports = {
    angularFiles
};
