const utils = require('../../utils/commons');
const constants = require('../../utils/constants');

function addObjectTypes(generator) {
    const tsProject = utils.getTsProject(generator);
    const relativeFilePath = 'graphql/graphql.common-types';
    const filePath = `${utils.getClientBaseDir(generator)}/${relativeFilePath}.ts`;
    const commonTypes = tsProject.getSourceFile(filePath);
    const baseUser = commonTypes.getClass('BaseUser');
    const { entityClass, fields, relationships } = generator;
    const moduleSpecifier = `${utils.isVue(generator) ? '@' : 'app'}/graphql`;
    const addedImport = utils.addImportIfMissing(commonTypes, { namedImport: entityClass, moduleSpecifier });
    if (addedImport) {
        commonTypes.insertClass(baseUser.getChildIndex() + 1, {
            isExported: true,
            name: `Base${entityClass}`,
            implements: [`Partial<${entityClass}>`],
            decorators: [{ name: 'ObjectType', arguments: [] }],
            properties: fields.map(f => ({ name: f.fieldName, hasExclamationToken: true, type: f.tsType }))
        });
        const detailUser = commonTypes.getClass('DetailUser');
        commonTypes.insertClass(detailUser.getChildIndex() + 1, {
            isExported: true,
            name: `Detail${entityClass}`,
            extends: `Base${entityClass}`,
            implements: [`Partial<${entityClass}>`],
            decorators: [{ name: 'ObjectType', arguments: [] }],
            properties: relationships.map(r => ({
                name: r.relationshipName,
                hasExclamationToken: true,
                type: `Base${r.otherEntityNameCapitalized}${r.ownerSide ? '' : '[]'}`
            }))
        });
        commonTypes.saveSync();
    }
}

function adjustCommonFiles(generator) {
    if (generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
        addObjectTypes(generator);
    }
}

module.exports = {
    adjustCommonFiles
};
