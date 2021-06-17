const nodejsConstants = require('generator-jhipster-nodejs/generators/generator-nodejs-constants');

const SERVER_NODEJS_DIR = `${nodejsConstants.SERVER_NODEJS_SRC_DIR}/`;

module.exports = {
    writeFiles
};

const serverFiles = {
    graphQL: [
        {
            path: SERVER_NODEJS_DIR,
            templates: [
                {
                    file: 'src/service/graphql/entity.object-type.ts',
                    renameTo: generator => `src/service/graphql/${generator.entityFileName}.object-type.ts`
                },
                {
                    file: 'src/web/graphql/entity.resolver.ts',
                    renameTo: generator => `src/web/graphql/${generator.entityFileName}.resolver.ts`
                }
            ]
        }
    ]
}

function writeFiles() {
    // TODO: adjust entity module
    // TODO: adjust entity dto
    return {
        writeGraphQLFiles() {
            this.writeFilestoDisk(serverFiles, this, false);
        }
    }
}
