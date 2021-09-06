const babel = require('@babel/core');
const t = require('@babel/types');
const babelGenerator = require('@babel/generator').default;
const fs = require('fs');
const path = require('path');
const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const AngularNeedleClient = require('generator-jhipster/generators/client/needle-api/needle-client-angular');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const constants = require('../../utils/constants');
const utils = require('../../utils/commons');

const angularFiles = [
    {
        templates: [
            {
                file: 'common/config/apollo-client.ts',
                renameTo: () => `${jHipsterConstants.ANGULAR_DIR}/config/apollo-client.ts`
            },
            {
                file: 'common/core/util/pub-sub.ts',
                renameTo: () => `${jHipsterConstants.ANGULAR_DIR}/core/util/pub-sub.ts`
            },
            {
                file: 'common/core/util/graphql-cache-watcher.ts',
                renameTo: () => `${jHipsterConstants.ANGULAR_DIR}/core/util/graphql-cache-watcher.ts`
            },
            {
                file: 'angular/graphql/graphql.module.ts',
                renameTo: () => `${jHipsterConstants.ANGULAR_DIR}/graphql/graphql.module.ts`
            },
            {
                file: 'angular/graphql/graphql.providers.ts',
                renameTo: () => `${jHipsterConstants.ANGULAR_DIR}/graphql/graphql.providers.ts`
            },
            {
                file: 'angular/graphql/graphql.cache.service.ts',
                renameTo: () => `${jHipsterConstants.ANGULAR_DIR}/graphql/graphql.cache.service.ts`
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
    }
];

function adjustProxyConfig(generator) {
    // read and parse the proxy configuration file
    const filePath = path.join('webpack', 'proxy.conf.js');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const ast = babel.parseSync(fileContent);
    // find the conf assignment in the function declaration
    const fun = ast.program.body.find(p => p.type === 'FunctionDeclaration' && p.id && p.id.name === 'setupProxy');
    const confAssignment = fun.body.body.find(
        s => s.type === 'VariableDeclaration' && s.declarations.find(d => d.type === 'VariableDeclarator' && d.id && d.id.name === 'conf')
    );
    const confDeclarator = confAssignment.declarations.find(d => d.type === 'VariableDeclarator' && d.id && d.id.name === 'conf');
    const initNode = confDeclarator.init.elements[0];
    const propertyNode = initNode.properties.find(p => p.key && p.key.name === 'context');
    // check if there already is an entry for the graphql endpoint
    const existingGraphQLEntry = propertyNode.value.elements.find(e => e.value === generator.endpoint);
    if (!existingGraphQLEntry) {
        // if none is found, add it and write the manipulated file
        propertyNode.value.elements.push(t.stringLiteral(generator.endpoint));
        confDeclarator.init.elements.push(utils.getWSProxyDeclaration(generator.getJhipsterConfig().get(OptionNames.SERVER_PORT)));

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
        e =>
            e.type === 'VariableDeclaration' &&
            e.declarations &&
            e.declarations.find(d => d.type === 'VariableDeclarator' && d.id && d.id.name === 'GraphQLTransformer')
    );
    if (existingGraphQLTransformerImportStatement) {
        return;
    }
    const expressionStatementIndex = ast.program.body.findIndex(
        e =>
            e.type === 'ExpressionStatement' &&
            e.expression.left &&
            e.expression.left.property &&
            e.expression.left.property.name === 'exports'
    );
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
        const requireExpression = t.callExpression(t.identifier('require'), [
            t.stringLiteral('graphql-typeop/transformers/graphql.transformer')
        ]);
        const requireDeclaration = t.variableDeclaration('const', [
            t.variableDeclarator(t.identifier('GraphQLTransformer'), requireExpression)
        ]);
        ast.program.body.splice(expressionStatementIndex - 1, 0, functionDeclaration);
        ast.program.body.splice(expressionStatementIndex - 1, 0, requireDeclaration);
        const arrowFunction = expressionStatement.expression.right;
        if (arrowFunction) {
            const functionCall = t.callExpression(t.identifier('addGraphQLTransformer'), [t.identifier('config')]);
            arrowFunction.body.body.unshift(functionCall);

            // insert proxy conf for WebSocket to BrowserSync config
            const browserSyncPlugin = utils.findBrowserSyncPlugin(ast);
            if (browserSyncPlugin) {
                const proxyDeclaration = browserSyncPlugin.arguments[0].properties.find(p => p.key.name === 'proxy').value;
                proxyDeclaration.properties.push(t.objectProperty(t.identifier('ws'), t.booleanLiteral(true)));
            }

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
    if (libs.indexOf(requiredLib) < 0) {
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

function adjustPagination(generator) {
    const tsProject = utils.getTsProject(generator);
    const filePath = `${jHipsterConstants.ANGULAR_DIR}/core/request/request.model.ts`;
    const requestModel = tsProject.getSourceFile(filePath);
    const pagination = requestModel.getInterface('Pagination');
    if (pagination) {
        pagination.addMember('bypassCache?: boolean');
        requestModel.saveSync();
    }
}

function adjustUserManagement(generator) {
    const tsProject = utils.getTsProject(generator);
    const filePath = `${jHipsterConstants.ANGULAR_DIR}/admin/user-management/list/user-management.component.ts`;
    const component = tsProject.getSourceFile(filePath);
    const componentClass = component.getClass(() => true);
    if (componentClass) {
        const loadAll = componentClass.getMethod('loadAll');
        if (loadAll) {
            loadAll.addParameter({ name: 'bypassCache', type: 'boolean', hasQuestionToken: true });
            const call = utils.getFunctionCall(loadAll, 'query');
            if (call && call.getArguments()[0]) {
                call.getArguments()[0].addShorthandPropertyAssignment({ name: 'bypassCache' });
                component.saveSync();
            }
        }
    }

    const templateFilePath = `${jHipsterConstants.ANGULAR_DIR}/admin/user-management/list/user-management.component.html`;
    const template = generator.fs.read(templateFilePath);
    generator.fs.write(templateFilePath, template.replace(/loadAll\(\)/g, 'loadAll(true)'));
}

function adjustAngularFiles(generator) {
    adjustTSConfig(generator);
    adjustWebpackConfig(generator);
    adjustProxyConfig(generator);
    addGraphQLModuleToAppModule(generator);
    adjustUserManagement(generator);
    adjustPagination(generator);
}

module.exports = {
    angularFiles,
    adjustAngularFiles
};
