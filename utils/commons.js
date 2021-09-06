const nodejsConstants = require('generator-jhipster-nodejs/generators/generator-nodejs-constants');
const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const babel = require('@babel/core');
const t = require('@babel/types');
const traverse = require('@babel/traverse').default;
const path = require('path');
const { Node, Project } = require('ts-morph');
const constants = require('./constants');
const { YeomanFileSystem } = require('./yeoman-file-system');

function getSourceFile(tsProject, filePath, server = false) {
    return tsProject.getSourceFile(server ? path.join(nodejsConstants.SERVER_NODEJS_SRC_DIR, filePath) : filePath);
}

function addImportIfMissing(sourceFile, importDeclarationOptions, defaultImport = false) {
    const { namedImport, moduleSpecifier } = importDeclarationOptions;
    let existingImport = sourceFile.getImportDeclaration(dec => dec.getModuleSpecifierValue() === moduleSpecifier);
    if (!existingImport) {
        existingImport = sourceFile.addImportDeclaration({ moduleSpecifier });
    }
    if (defaultImport) {
        if (!existingImport.getDefaultImport()) {
            existingImport.setDefaultImport(namedImport);
            return true;
        }
    } else if (!existingImport.getNamedImports().find(i => i.getName() === namedImport)) {
        existingImport.addNamedImport({ name: namedImport });
        return true;
    }
    return false;
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

function isVue(generator) {
    return generator.getJhipsterConfig().get(OptionNames.CLIENT_FRAMEWORK) === jHipsterConstants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;
}

function getClientBaseDir(generator) {
    if (isAngular(generator)) {
        return jHipsterConstants.ANGULAR_DIR;
    }
    if (isReact(generator)) {
        return jHipsterConstants.REACT_DIR;
    }
    if (isVue(generator)) {
        return jHipsterConstants.VUE_DIR;
    }
    return null;
}

function isNodeJSBlueprint(generator) {
    return !!generator
        .getJhipsterConfig()
        .get('blueprints')
        .find(b => b.name === 'generator-jhipster-nodejs');
}

function saveConfig(generator) {
    const config = {};
    copyConfig(generator, config, [
        constants.CONFIG_KEY_TYPE_DEFINITION,
        constants.CONFIG_KEY_SCHEMA_LOCATION,
        constants.CONFIG_KEY_ENDPOINT
    ]);
    generator.config.set(constants.CONFIG_KEY, config);
}

function loadConfig(generator, config) {
    config = config || generator.config.get(constants.CONFIG_KEY);
    copyConfig(config, generator, [
        constants.CONFIG_KEY_TYPE_DEFINITION,
        constants.CONFIG_KEY_SCHEMA_LOCATION,
        constants.CONFIG_KEY_ENDPOINT
    ]);
}

function copyConfig(from, to, keys) {
    keys.forEach(c => {
        if (c in from) {
            to[c] = from[c];
        }
    });
}

const capitalize = s => s && s[0].toUpperCase() + s.slice(1);

function getFunctionCall(method, functionName) {
    const statements = method.getBody().getDescendantStatements();
    let result;
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (Node.isExpressionStatement(statement) && Node.isCallExpression(statement.getExpression())) {
            result = findExpressionWithName(statement, functionName);
            if (result) {
                return result;
            }
        }
    }
    return result;
}

function getVariableAssignment(method, variableName) {
    const statements = method.getBody().getDescendantStatements();
    let result;
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (Node.isVariableStatement(statement)) {
            result = statement.getDeclarations().find(d => d.getName() === variableName);
            if (result) {
                return result;
            }
        }
    }
    return result;
}

function findExpressionWithName(expression, name) {
    if (expression.getText && expression.getText() === name) {
        return expression;
    }
    const subExpression = expression.getExpression && expression.getExpression();
    if (subExpression) {
        if ((subExpression.getName && subExpression.getName() === name) || (subExpression.getText && subExpression.getText() === name)) {
            return expression;
        }
        return findExpressionWithName(expression.getExpression(), name);
    }
    return null;
}

function findBrowserSyncPlugin(ast) {
    let result;
    traverse(ast, {
        enter(path) {
            if (t.isNewExpression(path) && path.node.callee.name === 'BrowserSyncPlugin') {
                result = path.node;
            }
        }
    });
    return result;
}

function getWSProxyDeclaration(port, react) {
    return babel.parse(`
const entry = {
  context: [
    '/graphql',
  ],
  target: 'ws' + (${react ? 'options.' : ''}tls ? 's' : '') + '://localhost:${port}',
  ws: true
}`
    ).program.body[0].declarations[0].init;
}

module.exports = {
    addImportIfMissing,
    getClientBaseDir,
    getTsProject,
    getSourceFile,
    isAngular,
    isReact,
    isVue,
    isNodeJSBlueprint,
    saveConfig,
    loadConfig,
    copyConfig,
    capitalize,
    getFunctionCall,
    getVariableAssignment,
    findBrowserSyncPlugin,
    getWSProxyDeclaration
};
