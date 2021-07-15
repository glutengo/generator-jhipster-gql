const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const constants = require('../generator-gql-constants');

const angularFiles = [
    {
        templates: [
            {
                file: `angular/entities/service/entity.gql.service.ts`,
                renameTo: generator =>
                    `${jhipsterConstants.ANGULAR_DIR}/entities/${generator.entityFolderName}/service/${generator.entityFileName}.gql.service.ts`
            }
        ]
    },
    {
        condition: generator => generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT,
        templates: [
            {
                file: `angular/entities/entity.gql.ts`,
                renameTo: generator =>
                    `${jhipsterConstants.ANGULAR_DIR}/entities/${generator.entityFolderName}/${generator.entityFileName}.gql.ts`
            }
        ]
    }
]

module.exports = {
    angularFiles
}
