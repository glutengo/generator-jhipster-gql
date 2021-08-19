const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const utils = require('./commons');

function addServiceProvider(generator) {
    const tsProject = utils.getTsProject(generator);
    const filePath = `${jHipsterConstants.ANGULAR_DIR}/graphql/graphql.providers.ts`;
    const providers = tsProject.getSourceFile(filePath);
    const variableDeclaration = providers.getVariableDeclaration(() => true);
    const initializer = variableDeclaration.getInitializer();
    if (generator.entityName === 'user') {
        const providedClass = `${generator.entityClass}Service`;
        const usedClass = `${generator.entityClass}GraphQLService`;
        const providedManagementClass = 'UserManagementService';
        const addedEntityServiceImport = utils.addImportIfMissing(providers, {
            moduleSpecifier: 'app/entities/user/user.service',
            namedImport: providedClass
        });
        const addedEntityGqlServiceImport = utils.addImportIfMissing(providers, {
            moduleSpecifier: 'app/entities/user/user.gql.service',
            namedImport: usedClass
        });
        const addedEntityManagementServiceImport = utils.addImportIfMissing(providers, {
            moduleSpecifier: 'app/admin/user-management/service/user-management.service',
            namedImport: providedManagementClass
        });

        if (addedEntityServiceImport || addedEntityGqlServiceImport) {
            initializer.addElement(`{ provide: ${providedClass}, useClass: ${usedClass} }`);
            providers.saveSync();
        }

        if (addedEntityManagementServiceImport) {
            initializer.addElement(`{ provide: ${providedManagementClass}, useClass: ${usedClass} }`);
            providers.saveSync();
        }
    } else {
        const providedClass = `${generator.entityClass}Service`;
        const usedClass = `${generator.entityClass}GraphQLService`;
        const addedEntityServiceImport = utils.addImportIfMissing(providers, {
            moduleSpecifier: `app/entities/${generator.entityFolderName}/service/${generator.entityFileName}.service`,
            namedImport: providedClass
        });
        const addedEntityGqlServiceImport = utils.addImportIfMissing(providers, {
            moduleSpecifier: `app/entities/${generator.entityFolderName}/service/${generator.entityFileName}.gql.service`,
            namedImport: usedClass
        });

        if (addedEntityServiceImport || addedEntityGqlServiceImport) {
            initializer.addElement(`{ provide: ${providedClass}, useClass: ${usedClass} }`);
            providers.saveSync();
        }
    }
}

function removeServiceProvider(generator) {
    const tsProject = utils.getTsProject(generator);
    const filePath = `${jHipsterConstants.ANGULAR_DIR}/graphql/graphql.providers.ts`;
    const providers = tsProject.getSourceFile(filePath);
    const usedClass = `${generator.entityClass}GraphQLService`;
    const variableDeclaration = providers.getVariableDeclaration(() => true);
    const initializer = variableDeclaration.getInitializer();
    const relevantEntries = initializer.getElements().filter(
        obj =>
            obj
                .getProperty('useClass')
                .getInitializer()
                .getText() === usedClass
    );
    if (relevantEntries.length) {
        relevantEntries.forEach(entry => initializer.removeElement(entry));
        providers.fixUnusedIdentifiers();
        providers.saveSync();
    }
}

module.exports = {
    addServiceProvider,
    removeServiceProvider
};
