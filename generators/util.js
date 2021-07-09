const nodejsConstants = require('generator-jhipster-nodejs/generators/generator-nodejs-constants');
const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const path = require('path');
const { Project } = require('ts-morph');

function getSourceFile(tsProject, filePath, server = false) {
    return tsProject.getSourceFile(server ? path.join(nodejsConstants.SERVER_NODEJS_SRC_DIR, filePath) : filePath);
}

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

function getTsProject(server = false) {
    const tsConfigFilePath = server ? `${nodejsConstants.SERVER_NODEJS_SRC_DIR}/tsconfig.json` : 'tsconfig.json';
    return new Project({tsConfigFilePath});
}

function isAngular(generator) {
    return generator.getJhipsterConfig().get(OptionNames.CLIENT_FRAMEWORK) === jHipsterConstants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
}

function isReact(generator) {
    return generator.getJhipsterConfig().get(OptionNames.CLIENT_FRAMEWORK) === jHipsterConstants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;
}

function isNodeJSBlueprint(generator) {
    return !! generator.getJhipsterConfig().get('blueprints').find(b => b.name === 'generator-jhipster-nodejs');
}

module.exports = {
    addImportIfMissing,
    getTsProject,
    getSourceFile,
    isAngular,
    isReact,
    isNodeJSBlueprint
}
