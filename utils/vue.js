const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const { capitalize } = require('./commons');

export function replaceServiceProvider(tsProject, entityName) {
    const filePath = `${jHipsterConstants.VUE_DIR}/main.ts`;
    const content = tsProject.getSourceFile(filePath);
    const serviceName = `${capitalize(entityName)}GraphQLService`;
    const providerKey = `${entityName}Service`
    const addedImport = utils.addImportIfMissing(content, {
        moduleSpecifier: `@/entities/${entityName}/${entityName}.gql.service`,
        namedImport: serviceName
    }, true);
    if (addedImport) {
        const expressionStatement = content.getStatement(statement => {
            if(Node.isExpressionStatement(statement)) {
                const expression = statement.getExpression();
                return Node.isNewExpression(expression);
            }
        });
        expressionStatement.getExpression()
            .getArguments()[0]
            .getProperty('provide')
            .getInitializer()
            .getProperty(providerKey)
            .setInitializer(`() => new ${serviceName}()`);
        content.saveSync();
    }
}

module.exports = {
    replaceServiceProvider
}
