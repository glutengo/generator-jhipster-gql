const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const utils = require('../../utils/commons');

const vueFiles = [
    {
        templates: [
            {
                file: 'vue/entities/entity.gql.service.ts',
                renameTo: generator =>
                    `${jHipsterConstants.VUE_DIR}/entities/${generator.entityFolderName}/${generator.entityFileName}.gql.service.ts`
            }
        ]
    }
];

/**
 * Adds the bypassCache parameter to the entity component
 *
 * @param generator The Yeoman generator
 */
function adjustEntityComponent(generator) {
    const tsProject = utils.getTsProject(generator);
    const filePath = `${jHipsterConstants.VUE_DIR}/entities/${generator.entityFolderName}/${generator.entityFileName}.component.ts`;
    const component = tsProject.getSourceFile(filePath);
    const componentClass = component.getClass(() => true);
    if (!componentClass) return;
    const retrieveAllName = `retrieveAll${generator.entityNamePlural}`;
    const retrieveAll = componentClass.getMethod(retrieveAllName);
    if (retrieveAll && retrieveAll.getParameters().length === 0) {
        retrieveAll.addParameter({ name: 'bypassCache', type: 'boolean', hasQuestionToken: true });
        const paginationQuery = utils.getVariableAssignment(retrieveAll, 'paginationQuery');
        const objectLiteralExpression = paginationQuery && paginationQuery.getInitializer();
        if (!objectLiteralExpression) return;
        objectLiteralExpression.addShorthandPropertyAssignment({ name: 'bypassCache' });
        const clear = componentClass.getMethod('clear');
        if (!clear) return;
        const retrieveAllCall = utils.getFunctionCall(clear, retrieveAllName);
        if (retrieveAllCall && retrieveAllCall.getArguments().length === 0) {
            retrieveAllCall.addArgument('true');
        }
        component.saveSync();
    }
}

function adjustVueFiles(generator) {
    adjustEntityComponent(generator);
}

module.exports = {
    vueFiles,
    adjustVueFiles
};
