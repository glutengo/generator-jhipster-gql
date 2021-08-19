const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const utils = require('../../utils/commons');

const reactFiles = [
    {
        templates: [
            {
                file: 'react/entities/entity.gql-actions.ts',
                renameTo: generator => `${jHipsterConstants.REACT_DIR}/entities/${generator.entityFolderName}/${generator.entityFileName}.gql-actions.ts`
            }
        ]
    }
];

function adjustComponent(generator) {
    const tsProject = utils.getTsProject(generator);
    const filePath = `${jHipsterConstants.REACT_DIR}/entities/${generator.entityFolderName}/${generator.entityFileName}.tsx`;
    const component = tsProject.getSourceFile(filePath);
    const componentName = utils.capitalize(generator.entityName);
    const functionName = 'getAllEntities';
    const sortFunctionName = 'sortEntities';
    const reactComponentStatement = component.getVariableStatement(componentName);
    const reactComponent = reactComponentStatement && reactComponentStatement.getDeclarations().find(d => d.getName() === componentName);
    if (reactComponent) {
        const getAllEntities = utils.getVariableAssignment(reactComponent.getInitializer(), functionName);
        if (getAllEntities) {
            getAllEntities.getInitializer().addParameter({ name: 'bypassCache', type: 'boolean', hasQuestionToken: true });
            const sortEntities = utils.getVariableAssignment(reactComponent.getInitializer(), sortFunctionName);
            if (sortEntities) {
                sortEntities.getInitializer().addParameter({ name: 'bypassCache', type: 'boolean', hasQuestionToken: true });
                const getAllEntitiesCall = utils.getFunctionCall(sortEntities.getInitializer(), 'getAllEntities');
                if (getAllEntitiesCall) {
                    getAllEntitiesCall.addArgument('bypassCache');
                    const handleSyncList = utils.getVariableAssignment(reactComponent.getInitializer(), 'handleSyncList');
                    if (handleSyncList) {
                        const sortAllEntitiesCall = utils.getFunctionCall(handleSyncList.getInitializer(), sortFunctionName);
                        if (sortAllEntitiesCall && sortAllEntitiesCall.getArguments().length === 0) {
                            sortAllEntitiesCall.addArgument('true');

                            // TODO: move to entity-client-enable because the default action creator only accepts three arguments
                            const getEntitiesCall = utils.getFunctionCall(getAllEntities.getInitializer(), 'getEntities');
                            if (getEntitiesCall) {
                                getEntitiesCall.addArgument('bypassCache');
                                component.saveSync();
                            }
                        }
                    }
                }
            }
        }
    }
}

function adjustReactFiles(generator) {
    adjustComponent(generator);
}

module.exports = {
    reactFiles,
    adjustReactFiles
};
