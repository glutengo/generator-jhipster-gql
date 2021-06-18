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
                    file: `angular/entities/service/entity.gql.service.ts`,
                    renameTo: generator =>
                        `${constants.ANGULAR_DIR}entities/${generator.entityFolderName}/service/${generator.entityFileName}.gql.service.ts`
                },
                {
                    file: `angular/entities/entity.graphql`,
                    renameTo: generator =>
                        `${constants.ANGULAR_DIR}entities/${generator.entityFolderName}/${generator.entityFileName}.graphql`
                }
            ]
        }
    ]

}

function writeFiles() {
    return {
        graphQLEntityFiles () {
            this.clientFramework = this.getJhipsterConfig().get('clientFramework');
            this.writeFilesToDisk(clientFiles, this, false);
        }
    }
}
