const utils = require('./commons');

function replaceImportPath(generator, disable = false) {
    const fileName = generator.entityName === 'user' ? 'user-management' : generator.entityName.toLowerCase();
    let oldFileName = `${fileName}.reducer`;
    let newFileName = `${fileName}.gql-actions`;
    if (disable) {
        const tmp = oldFileName;
        oldFileName = newFileName;
        newFileName = tmp;
    }
    const tsProject = utils.getTsProject(generator);
    const sourceFiles = tsProject.getSourceFiles('**/*.tsx');
    sourceFiles.forEach(file => {
        const oldImport = file.getImportDeclaration(declaration => declaration.getModuleSpecifierValue().includes(oldFileName));
        if (oldImport) {
            oldImport.setModuleSpecifier(oldImport.getModuleSpecifierValue().replace(oldFileName, newFileName));
            file.saveSync();
        }
    });
}

module.exports = {
    replaceImportPath
};
