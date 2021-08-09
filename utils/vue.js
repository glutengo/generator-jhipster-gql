const { Node } = require('ts-morph');
const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const utils = require('./commons');

function replaceServiceProvider(tsProject, entityName, disable = false) {
    const filePath = `${jHipsterConstants.VUE_DIR}/main.ts`;
    const content = tsProject.getSourceFile(filePath);
    const serviceName = `${utils.capitalize(entityName)}${disable ? '' : 'GraphQL'}Service`;
    const providerKey = `${entityName.toLowerCase()}Service`;
    const addedImport = utils.addImportIfMissing(
        content,
        {
            moduleSpecifier: `@/entities/${entityName}/${entityName}${disable ? '' : '.gql'}.service`,
            namedImport: serviceName
        },
        true
    );
    if (addedImport) {
        const expressionStatement = getNewExpression(content);
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

function connectCacheWatcherOnCreated(tsProject) {
    const filePath = `${jHipsterConstants.VUE_DIR}/main.ts`;
    const content = tsProject.getSourceFile(filePath);
    const functionName = 'connectGraphQLCacheWatcher';
    const addedImport = utils.addImportIfMissing(content, {
        moduleSpecifier: '@/shared/config/apollo-client',
        namedImport: functionName
    });
    if (addedImport) {
        const expressionStatement = getNewExpression(content);
        expressionStatement
            .getExpression()
            .getArguments()[0]
            .addPropertyAssignment({ name: 'created', initializer: 'function() { connectGraphQLCacheWatcher(this); }' });
        content.fixUnusedIdentifiers();
        content.saveSync();
    }
}

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
