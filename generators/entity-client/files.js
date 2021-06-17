const constants = require('generator-jhipster/generators/generator-constants');

module.exports = {
    writeFiles
};

const clientFiles = {
    angular: [
        {
            condition: generator => !generator.embedded && generator.clientFramework === constants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR,
            templates: [
                {
                    file: `angular/${constants.ANGULAR_DIR}entities/service/entity.gql.service.ts`,
                    renameTo: generator =>
                        `${constants.ANGULAR_DIR}entities/${generator.entityFolderName}/service/${generator.entityFileName}.gql.service.ts`
                },
                {
                    file: `angular/${constants.ANGULAR_DIR}entities/entity.graphql`,
                    renameTo: generator =>
                        `${constants.ANGULAR_DIR}entities/${generator.entityFolderName}/${generator.entityFileName}.graphql`
                }
            ]
        }
    ]

}

function writeFiles() {
    return {
        writeGraphQLFiles() {
            this.clientFramework = this.getJhipsterConfig().clientFramework;
            this.writeFilestoDisk(serverFiles, this, false);
        }
    }
}
