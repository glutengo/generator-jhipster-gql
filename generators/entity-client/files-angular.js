const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const utils = require('../../utils/commons');

const angularFiles = [
    {
        templates: [
            {
                file: 'angular/entities/service/entity.gql.service.ts',
                renameTo: generator =>
                    `${jHipsterConstants.ANGULAR_DIR}/entities/${generator.entityFolderName}/service/${generator.entityFileName}.gql.service.ts`
            }
        ]
    }
];

function adjustEntityComponent(generator) {
    const tsProject = utils.getTsProject(generator);
    const filePath = `${jHipsterConstants.ANGULAR_DIR}/entities/${generator.entityFolderName}/list/${generator.entityFileName}.component.ts`;
    const component = tsProject.getSourceFile(filePath);
    const componentClass = component.getClass(() => true);
    if (componentClass) {
        const loadPage = componentClass.getMethod('loadPage');
        if (loadPage) {
            const call = utils.getFunctionCall(loadPage, 'query');
            const objectLiteralExpression = call.getArguments()[0];
            if (objectLiteralExpression) {
                objectLiteralExpression.addPropertyAssignment({ name: 'bypassCache', initializer: '!dontNavigate' });
                component.saveSync();
            }
        }
    }
}

function adjustAngularFiles(generator) {
    adjustEntityComponent(generator);
}

module.exports = {
    angularFiles,
    adjustAngularFiles
};
