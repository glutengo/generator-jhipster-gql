const jHipsterConstants = require('generator-jhipster/generators/generator-constants');

const reactFiles = [
    {
        templates: [
            {
                file: 'react/entities/entity.gql-actions.ts',
                renameTo: generator =>
                    `${jHipsterConstants.REACT_DIR}/entities/${generator.entityFolderName}/${generator.entityFileName}.gql-actions.ts`
            }
        ]
    }
];

function adjustReactFiles(generator) {
}

module.exports = {
    reactFiles,
    adjustReactFiles
};
