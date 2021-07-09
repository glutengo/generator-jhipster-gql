const constants = require('../generator-gql-constants');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const { isAngular } = require('../util');

module.exports = {
    writeFiles
};

const clientFiles = {
    angular: [
        {
            condition: generator => isAngular(generator),
            templates: [
                {
                    file: `angular/entities/service/entity.gql.service.ts`,
                    renameTo: generator =>
                        `${jhipsterConstants.ANGULAR_DIR}entities/${generator.entityFolderName}/service/${generator.entityFileName}.gql.service.ts`
                }
            ]
        },
        {
            condition: generator => isAngular(generator) && generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT,
            templates: [
                {
                    file: `angular/entities/entity.gql.ts`,
                    renameTo: generator =>
                        `${jhipsterConstants.ANGULAR_DIR}entities/${generator.entityFolderName}/${generator.entityFileName}.gql.ts`
                }
            ]
        },
        {
            condition: generator => isAngular(generator) && generator.typeDefinition === constants.TYPE_DEFINITION_GRAPHQL,
            templates: [
                {
                    file: `angular/entities/entity.graphql`,
                    renameTo: generator =>
                        `${jhipsterConstants.ANGULAR_DIR}entities/${generator.entityFolderName}/${generator.entityFileName}.graphql`
                }
            ]
        }

    ]

}

function writeFiles() {
    return {
        graphQLEntityFiles () {
            this.writeFilesToDisk(clientFiles, this, false);
        }
    }
}
