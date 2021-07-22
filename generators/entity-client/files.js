const constants = require('../../utils/constants');
const { isAngular, getClientBaseDir, isReact } = require('../../utils/commons');
const { angularFiles, adjustAngularFiles } = require('./files-angular');
const { reactFiles } = require('./files-react');

module.exports = {
    writeFiles
};

const clientFiles = {
    common: [
        {
            condition: generator => generator.typeDefinition === constants.TYPE_DEFINITION_GRAPHQL,
            templates: [
                {
                    file: `common/entities/entity.graphql`,
                    renameTo: generator =>
                        `${getClientBaseDir(generator)}entities/${generator.entityFolderName}/${generator.entityFileName}.graphql`
                }
            ]
        },
        {
            condition: generator => generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT,
            templates: [
                {
                    file: `common/entities/entity.gql.ts`,
                    renameTo: generator =>
                        `${getClientBaseDir(generator)}/entities/${generator.entityFolderName}/${generator.entityFileName}.gql.ts`
                }
            ]

        }
    ]
}

function writeFiles() {
    return {
        graphQLEntityFiles() {
            const files = { ...clientFiles };
            if (isAngular(this)) {
                files.angular = angularFiles;
            }
            if (isReact(this)) {
                files.react = reactFiles;
            }
            this.writeFilesToDisk(files, this, false);
        },
        adjustReactFiles() {
            if (isAngular(this)) {
                adjustAngularFiles(this);
            }
        }
    }
}
