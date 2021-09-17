const { Node } = require('ts-morph');
const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const utils = require('./commons');

/**
 * Replaces the Rest Service by the GraphQL service for the given entity or vice versa.
 *
 * @param tsProject The ts-morph project
 * @param entityName The entity name
 * @param disable Whether to disable GraphQL
 */
function replaceServiceProvider(tsProject, entityName, disable = false) {
    const filePath = `${jHipsterConstants.VUE_DIR}/main.ts`;
    const content = tsProject.getSourceFile(filePath);
    const serviceName = `${utils.capitalize(entityName)}${disable ? '' : 'GraphQL'}Service`;
    const providerKey = `${entityName.toLowerCase()}Service`;

    // add the import statement
    const addedImport = utils.addImportIfMissing(
        content,
        {
            moduleSpecifier: `@/entities/${entityName.toLowerCase()}/${entityName.toLowerCase()}${disable ? '' : '.gql'}.service`,
            namedImport: serviceName
        },
        true
    );

    // Replace the EntityService by the EntityGraphQLService (or vice versa)
    if (addedImport) {
        const expressionStatement = getNewExpression(content);
        if (!expressionStatement) return;
        expressionStatement
            .getExpression()
            .getArguments()[0]
            .getProperty('provide')
            .getInitializer()
            .getProperty(providerKey)
            .setInitializer(`() => new ${serviceName}()`);
        content.fixUnusedIdentifiers();
        content.saveSync();
    }
}

/**
 * Scaffold to onCreated Function for GraphQLCacheWatcher
 *
 * @param tsProject The ts-morph project
 */
function connectCacheWatcherOnCreated(tsProject) {
    const filePath = `${jHipsterConstants.VUE_DIR}/main.ts`;
    const content = tsProject.getSourceFile(filePath);
    const functionName = 'connectGraphQLCacheWatcher';

    // add the import statement
    const addedImport = utils.addImportIfMissing(content, {
        moduleSpecifier: '@/shared/config/apollo-client',
        namedImport: functionName
    });

    // add the connectGraphQLWatcher call
    if (addedImport) {
        const expressionStatement = getNewExpression(content);
        if (!expressionStatement) return;
        expressionStatement
            .getExpression()
            .getArguments()[0]
            .addPropertyAssignment({ name: 'created', initializer: 'function() { connectGraphQLCacheWatcher(this); }' });
        content.fixUnusedIdentifiers();
        content.saveSync();
    }
}

/**
 * Find a new expression
 *
 * @param content The node
 * @returns {NewExpression} The expression
 */
function getNewExpression(content) {
    return content.getStatement(statement => {
        if (Node.isExpressionStatement(statement)) {
            const expression = statement.getExpression();
            return Node.isNewExpression(expression);
        }
        return false;
    });
}

module.exports = {
    replaceServiceProvider,
    connectCacheWatcherOnCreated
};
