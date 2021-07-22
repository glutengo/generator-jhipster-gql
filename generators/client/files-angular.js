const babel = require('@babel/core');
const t = require('@babel/types');
const babelGenerator = require('@babel/generator').default;
const fs = require('fs');
const path = require('path');
const constants = require('../../utils/constants');
const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const AngularNeedleClient = require('generator-jhipster/generators/client/needle-api/needle-client-angular');

const angularFiles = [{
    templates: [
        {
            file: 'angular/graphql/graphql.module.ts',
            renameTo: () => `${jHipsterConstants.ANGULAR_DIR}/graphql/graphql.module.ts`
        },
        {
            file: 'angular/graphql/graphql.providers.ts',
            renameTo: () => `${jHipsterConstants.ANGULAR_DIR}/graphql/graphql.providers.ts`
        },
        {
            file: 'angular/core/util/graphql-util.service.ts',
            renameTo: () => `${jHipsterConstants.ANGULAR_DIR}/core/util/graphql-util.service.ts`
        },
        {
            file: 'angular/entities/user/user.gql.service.ts',
            renameTo: () => `${jHipsterConstants.ANGULAR_DIR}/entities/user/user.gql.service.ts`
        }
    ]
}];


function adjustProxyConfig(generator) {
    // read and parse the proxy configuration file
    const filePath = path.join('webpack', 'proxy.conf.js');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const ast = babel.parseSync(fileContent);
    // find the conf assignment in the function declaration
    const fun = ast.program.body.find(p => p.type === 'FunctionDeclaration' && p.id && p.id.name === 'setupProxy');
    const confAssignment = fun.body.body.find(s => s.type === 'VariableDeclaration' && s.declarations.find(d => d.type === 'VariableDeclarator' && d.id && d.id.name === 'conf'));
    const confDeclarator = confAssignment.declarations.find(d => d.type === 'VariableDeclarator' && d.id && d.id.name === 'conf')
    const initNode = confDeclarator.init.elements[0];
    const propertyNode = initNode.properties.find(p => p.key && p.key.name === 'context');
    // check if there already is an entry for the graphql endpoint
    const existingGraphQLEntry = propertyNode.value.elements.find(e => e.value === generator.endpoint);
    if (!existingGraphQLEntry) {
        // if none is found, add it and write the manipulated file
        propertyNode.value.elements.push(t.stringLiteral(generator.endpoint));
        const generatedFileContent = babelGenerator(ast, { quotes: 'single' });
        generator.fs.write(filePath, generatedFileContent.code);
    }
}

function adjustWebpackConfig(generator) {
    const filePath = path.join('webpack', 'webpack.custom.js');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const ast = babel.parseSync(fileContent);
    // stop if there already is an import statement for GraphQLTransformer
    const existingGraphQLTransformerImportStatement = ast.program.body.find(
        e => e.type === 'VariableDeclaration' && e.declarations && e.declarations.find(d => d.type === 'VariableDeclarator' && d.id && d.id.name === 'GraphQLTransformer'));
    if (existingGraphQLTransformerImportStatement) {
        return;
    }
    const expressionStatementIndex = ast.program.body.findIndex(e => e.type === 'ExpressionStatement' && e.expression.left && e.expression.left.property && e.expression.left.property.name === 'exports');
    const expressionStatement = ast.program.body[expressionStatementIndex];
    if (expressionStatement) {
        const functionDeclaration = babel.parseSync(`
function addGraphQLTransformer(config) {
  const awp = config.plugins.find(p => !!p.pluginOptions);
  const oldFunction = awp.createFileEmitter;
  awp.createFileEmitter = (program, transformers, getExtraDependencies, onAfterEmit) => {
    const factory = GraphQLTransformer.default.create(program.getProgram());
    transformers.before = [factory, ...transformers.before];
    return oldFunction.call(awp, program, transformers, getExtraDependencies, onAfterEmit);
  }
}`).program.body[0];
        const requireExpression = t.callExpression(t.identifier('require'), [t.stringLiteral('graphql-typeop/transformers/graphql.transformer')]);
        const VariableDeclaration = t.variableDeclaration('const', [t.variableDeclarator(t.identifier('GraphQLTransformer'), requireExpression)]);
        ast.program.body.splice(expressionStatementIndex - 1, 0, functionDeclaration);
        ast.program.body.splice(expressionStatementIndex - 1, 0, VariableDeclaration);
        const arrowFunction = expressionStatement.expression.right;
        if (arrowFunction) {
            const functionCall = t.callExpression(t.identifier('addGraphQLTransformer'), [t.identifier('config')]);
            arrowFunction.body.body.unshift(functionCall);
            const generatedFileContent = babelGenerator(ast, { quotes: 'single' });
            generator.fs.write(filePath, generatedFileContent.code);
        }
    }
}

function adjustTSConfig(generator) {
    const tsConfigJsonStorage = generator.createStorage('tsconfig.json');
    const compilerOptionsStorage = tsConfigJsonStorage.createStorage('compilerOptions');
    const libs = compilerOptionsStorage.get('lib');
    const requiredLib = 'esnext.asynciterable';
    if (libs.indexOf(requiredLib) < 0 ) {
        compilerOptionsStorage.set('lib', [...libs, requiredLib]);
    }
    if (generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
        compilerOptionsStorage.set('emitDecoratorMetadata', true);
    }
    tsConfigJsonStorage.save();
}

function addGraphQLModuleToAppModule(generator) {
    const needleClient = new AngularNeedleClient(generator);
    needleClient.addModule('', 'GraphQL', 'graphql', 'graphql', false, null);
}

/*function addGraphQLProvidersToAppModule(tsProject) {
    const filePath = `${jHipsterConstants.ANGULAR_DIR}/app.module.ts`;
    const appModule = tsProject.getSourceFile(filePath);
    const graphQLProviders = 'graphQLProviders';
    const added = utils.addImportIfMissing(appModule, { moduleSpecifier: './graphql/graphql.providers', namedImport: graphQLProviders});
    if (added) {
        const _class = appModule.getClass(() => true);
        const moduleDecorator = _class.getDecorator('NgModule');
        const moduleProviders = moduleDecorator.getArguments()[0].getProperty('providers').getInitializer();
        moduleProviders.insertElement(moduleProviders.getElements().length, graphQLProviders);
        appModule.saveSync();
    }
}*/

function adjustAngularFiles(generator) {
    addGraphQLModuleToAppModule(generator);
    adjustProxyConfig(generator);
    if (generator.experimentalTransformer) {
        adjustWebpackConfig(generator);
    }
    adjustTSConfig(generator);
}

module.exports = {
    angularFiles,
    adjustAngularFiles
}
