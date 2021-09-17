const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const utils = require('./commons');

/**
 * Adds the GraphQL service provider entry to the Angular project for the entity managed by the generator.
 * The generator is expected to hold entity information such as the entityName.
 *
 * @param generator the Yeoman generator
 */
function addServiceProvider(generator) {
    const tsProject = utils.getTsProject(generator);
    const filePath = `${jHipsterConstants.ANGULAR_DIR}/graphql/graphql.providers.ts`;
    const providers = tsProject.getSourceFile(filePath);
    const variableDeclaration = providers.getVariableDeclaration(() => true);
    if (!variableDeclaration) return;
    const initializer = variableDeclaration.getInitializer();
    if (!initializer) return;

    // special behavior for the user entity: Add the UserService and the UserManagementService
    if (generator.entityName === 'user') {
        const providedClass = `${generator.entityClass}Service`;
        const usedClass = `${generator.entityClass}GraphQLService`;
        const providedManagementClass = 'UserManagementService';

        // add the import statements
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

        // add the provider list entries
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

        // add the import statement
        const addedEntityServiceImport = utils.addImportIfMissing(providers, {
            moduleSpecifier: `app/entities/${generator.entityFolderName}/service/${generator.entityFileName}.service`,
            namedImport: providedClass
        });
        const addedEntityGqlServiceImport = utils.addImportIfMissing(providers, {
            moduleSpecifier: `app/entities/${generator.entityFolderName}/service/${generator.entityFileName}.gql.service`,
            namedImport: usedClass
        });

        // add the provider list entry
        if (addedEntityServiceImport || addedEntityGqlServiceImport) {
            initializer.addElement(`{ provide: ${providedClass}, useClass: ${usedClass} }`);
            providers.saveSync();
        }
    }
}

/**
 * Adds the GraphQL service provider entry from the Angular project for the entity managed by the generator.
 * The generator is expected to hold entity information such as the entityName.
 *
 * Remove the
 * @param generator
 */
function removeServiceProvider(generator) {
    const tsProject = utils.getTsProject(generator);
    const filePath = `${jHipsterConstants.ANGULAR_DIR}/graphql/graphql.providers.ts`;
    const providers = tsProject.getSourceFile(filePath);
    const usedClass = `${generator.entityClass}GraphQLService`;
    const variableDeclaration = providers.getVariableDeclaration(() => true);
    if (!variableDeclaration) return;
    const initializer = variableDeclaration.getInitializer();
    if (!initializer) return;

    // find the entries which use the GraphQL service of the entity and remove them
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
