function addImportIfMissing(sourceFile, importDeclationOptions) {
    const { namedImport, moduleSpecifier } = importDeclationOptions;
    let existingImport = sourceFile.getImportDeclaration(dec => dec.getModuleSpecifierValue() === moduleSpecifier);
    if (!existingImport) {
        existingImport = sourceFile.addImportDeclaration({ moduleSpecifier: moduleSpecifier });
    }
    if (!existingImport.getNamedImports().find(i => i.getName() === namedImport)) {
        existingImport.addNamedImport({name: namedImport});
        return true;
    }
}

module.exports = {
    addImportIfMissing
}

