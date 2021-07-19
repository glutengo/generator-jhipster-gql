const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const constants = require('../generator-gql-constants');
const utils = require('../util');

const angularFiles = [
    {
        templates: [
            {
                file: `angular/entities/service/entity.gql.service.ts`,
                renameTo: generator =>
                    `${jhipsterConstants.ANGULAR_DIR}/entities/${generator.entityFolderName}/service/${generator.entityFileName}.gql.service.ts`
            }
        ]
    }
];

function adjustAngularFiles(generator) {
    const tsProject = utils.getTsProject(generator);
    const filePath = `${jhipsterConstants.ANGULAR_DIR}/graphql/graphql.providers.ts`;
    const providers = tsProject.getSourceFile(filePath);
    const providedClass = `${generator.entityClass}Service`;
    const usedClass = `${generator.entityClass}GraphQLService`;
    const addedEntityServiceImport = utils.addImportIfMissing(providers, { moduleSpecifier: `app/entities/${generator.entityFolderName}/service/${generator.entityFileName}.service`, namedImport: providedClass});
    const addedEntityGqlServiceImport = utils.addImportIfMissing(providers, { moduleSpecifier: `app/entities/${generator.entityFolderName}/service/${generator.entityFileName}.gql.service`, namedImport: usedClass});

    if (addedEntityServiceImport || addedEntityGqlServiceImport) {
        const variableDeclaration = providers.getVariableDeclaration(() => true);
        const initializer = variableDeclaration.getInitializer();
        initializer.addElement(`{ provide: ${providedClass}, useClass: ${usedClass} }`);
        providers.saveSync();

    }
}

module.exports = {
    angularFiles,
    adjustAngularFiles
}
