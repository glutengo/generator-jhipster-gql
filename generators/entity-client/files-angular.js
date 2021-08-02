const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const { addServiceProvider } = require('../../utils/angular');

const angularFiles = [
    {
        templates: [
            {
                file: `angular/entities/service/entity.gql.service.ts`,
                renameTo: generator =>
                    `${jHipsterConstants.ANGULAR_DIR}/entities/${generator.entityFolderName}/service/${generator.entityFileName}.gql.service.ts`
            }
        ]
    }
];

function adjustAngularFiles(generator) {
    addServiceProvider(generator);
}

module.exports = {
    angularFiles,
    adjustAngularFiles
};
