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

/**
 * Get the ts-morph source file
 *
 * @param tsProject The tsProject
 * @param filePath The relative filePath
 * @param server Will resolve the path relative to the server directory if set to true
 * @returns {ts.SourceFile} the ts-morph source file
 */
function getSourceFile(tsProject, filePath, server = false) {
    return tsProject.getSourceFile(server ? path.join(nodejsConstants.SERVER_NODEJS_SRC_DIR, filePath) : filePath);
}

/**
 * Adds the given imports to the given file if they are not already present
 *
 * @param sourceFile The ts-morph source file to adjust
 * @param importDeclarationOptions The import declarations to add
 * @param defaultImport Whether to use the default import
 * @returns {boolean} Whether an import was added
 */
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

/**
 * Get the ts-morph project of the generator
 *
 * @param generator The Yeoman generator
 * @param server Server source files are used if this is set to true
 * @returns {Project} The ts-morph project
 */
function getTsProject(generator, server = false) {
    const tsConfigFilePath = server ? `${nodejsConstants.SERVER_NODEJS_SRC_DIR}/tsconfig.json` : 'tsconfig.json';
    return new Project({
        tsConfigFilePath,
        fileSystem: new YeomanFileSystem(generator)
    });
}

/**
 * Check whether the generator uses Angular as the client framework
 *
 * @param generator The Yeoman generator
 * @returns {boolean} true if the client framework is Angular
 */
function isAngular(generator) {
    return generator.getJhipsterConfig().get(OptionNames.CLIENT_FRAMEWORK) === jHipsterConstants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR;
}

/**
 * Check whether the generator uses React as the client framework
 *
 * @param generator The Yeoman generator
 * @returns {boolean} true if the client framework is React
 */
function isReact(generator) {
    return generator.getJhipsterConfig().get(OptionNames.CLIENT_FRAMEWORK) === jHipsterConstants.SUPPORTED_CLIENT_FRAMEWORKS.REACT;
}

/**
 * Check whether the generator uses Vue as the client framework
 *
 * @param generator The Yeoman generator
 * @returns {boolean} true if the client framework is Vue
 */
function isVue(generator) {
    return generator.getJhipsterConfig().get(OptionNames.CLIENT_FRAMEWORK) === jHipsterConstants.SUPPORTED_CLIENT_FRAMEWORKS.VUE;
}

/**
 * Get the client base directory of the generator
 *
 * @param generator The Yeoman generator
 * @returns {string} The client base directory
 */
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

/**
 * Check whether the generator uses the Node.js Blueprint
 *
 * @param generator The Yeoman Generator
 * @returns {boolean} Whether the Node.js Blueprint is used
 */
function isNodeJSBlueprint(generator) {
    return !!generator
        .getJhipsterConfig()
        .get('blueprints')
        .find(b => b.name === 'generator-jhipster-nodejs');
}

/**
 * Save the module-specific config of the generator
 *
 * @param generator The Yeoman generator
 */
function saveConfig(generator) {
    const config = {};
    copyConfig(generator, config, [
        constants.CONFIG_KEY_TYPE_DEFINITION,
        constants.CONFIG_KEY_SCHEMA_LOCATION,
        constants.CONFIG_KEY_ENDPOINT
    ]);
    generator.config.set(constants.CONFIG_KEY, config);
}

/**
 * Load the module-specific config of the generator
 *
 * @param generator The Yeoman generator
 */
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

/**
 * Capitalize a string
 *
 * @param s The string
 * @returns {string}
 */
const capitalize = s => s && s[0].toUpperCase() + s.slice(1);

/**
 * Get a function call inside a method
 *
 * @param method The method to look in
 * @param functionName The name of the called function
 * @returns The function call expression
 */
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

/**
 * Get a variable assignment inside a method
 * @param method The method to look in
 * @param variableName The name of the variable
 * @returns The variable declaration
 */
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

/**
 * Get an expression with a given name
 *
 * @param expression The expression to look in
 * @param name The name to find
 * @returns {{getText}|*|null} The expression
 */
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

/**
 * Find the browser sync plugin inside a webpack config
 *
 * @param ast The AST of the webpack config
 * @returns {*} The BrowserSyncPlugin expression
 */
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

/**
 * Get the WSProxyDeclaration for use in a webpack config
 *
 * @param port The port to use
 * @param framework The framework to use
 * @returns {Expression} The declaration
 */
function getWSProxyDeclaration(port, framework) {
    let target;
    switch (framework) {
        case 'react':
            target = `'ws' + (options.tls ? 's' : '') + '://localhost:${port}'`;
            break;
        case 'vue':
            target = `'ws://localhost:${port}'`;
            break;
        default:
            target = `'ws' + (tls ? 's' : '') + '://localhost:${port}'`;
    }
    return babel.parse(`
const entry = {
  context: [
    '/graphql',
  ],
  target: ${target},
  ws: true
}`
    ).program.body[0].declarations[0].init;
}

/**
 * Reat the package.json for the given generator
 *
 * @param generator The Yeoman generator
 * @param server Whether to check the server instead of the client
 * @returns {*}
 */
function getDependabotPackageJSON(generator, server = false) {
    return generator.fs.readJSON(path.join(__dirname, '..', 'generators', server ? 'server' : 'client', 'package.json'));
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
    getWSProxyDeclaration,
    getDependabotPackageJSON
};
