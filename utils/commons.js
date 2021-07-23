const nodejsConstants = require('generator-jhipster-nodejs/generators/generator-nodejs-constants');
const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const constants = require('./constants');
const path = require('path');
const { Project } = require('ts-morph');
const { YeomanFileSystem } = require('./yeoman-file-system');

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

function getTsProject(generator, server = false) {
    const tsConfigFilePath = server ? `${nodejsConstants.SERVER_NODEJS_SRC_DIR}/tsconfig.json` : 'tsconfig.json';
    return new Project({
        tsConfigFilePath,
        fileSystem: new YeomanFileSystem(generator)
    });
}

function isAngular(generator) {
    return generator.getJhipsterConfig().get(OptionNames.CLIENT_FRAMEWORK) === jHipsterConstants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
}

function isReact(generator) {
    return generator.getJhipsterConfig().get(OptionNames.CLIENT_FRAMEWORK) === jHipsterConstants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;
}

function getClientBaseDir(generator) {
    if (isAngular(generator)) {
        return jHipsterConstants.ANGULAR_DIR;
    }
    if (isReact(generator)) {
        return jHipsterConstants.REACT_DIR;
    }
}

function isNodeJSBlueprint(generator) {
    return !! generator.getJhipsterConfig().get('blueprints').find(b => b.name === 'generator-jhipster-nodejs');
}

function saveConfig(generator) {
    const config = {};
    copyConfig(generator, config, [
        constants.CONFIG_KEY_TYPE_DEFINITION,
        constants.CONFIG_KEY_EXPERIMENTAL_TRANSFORMER,
        constants.CONFIG_KEY_SCHEMA_LOCATION,
        constants.CONFIG_KEY_ENDPOINT
    ]);
    generator.config.set(constants.CONFIG_KEY, config);
}

function loadConfig(generator, config) {
    config = config || generator.config.get(constants.CONFIG_KEY);
    copyConfig(config, generator, [
        constants.CONFIG_KEY_TYPE_DEFINITION,
        constants.CONFIG_KEY_EXPERIMENTAL_TRANSFORMER,
        constants.CONFIG_KEY_SCHEMA_LOCATION,
        constants.CONFIG_KEY_ENDPOINT
    ]);
}

function copyConfig(from, to, keys) {
    keys.forEach(c => {
        if (c in from) {
            to[c] = from[c]}
        }
    );
}

module.exports = {
    addImportIfMissing,
    getClientBaseDir,
    getTsProject,
    getSourceFile,
    isAngular,
    isReact,
    isNodeJSBlueprint,
    saveConfig,
    loadConfig,
    copyConfig
}
