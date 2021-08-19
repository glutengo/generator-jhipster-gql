const utils = require('./commons');

function replaceImportPath(generator, disable = false) {
    let oldFileName = generator.entityName === 'user' ? 'user-management.reducer' : `${generator.entityName.toLowerCase()}.reducer`;
    let newFileName = `${generator.entityName.toLowerCase()}.gql-actions`;
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
