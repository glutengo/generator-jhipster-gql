const babel = require('@babel/core');
const t = require('@babel/types');
const babelGenerator = require('@babel/generator').default;
const fs = require('fs');
const path = require('path');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const constants = require('../generator-gql-constants');
const { isAngular, isReact } = require('../util');
const AngularNeedleClient = require('generator-jhipster/generators/client/needle-api/needle-client-angular');

const ANGULAR_DIR = jhipsterConstants.ANGULAR_DIR;

const clientFiles = {
    angular: [
        {
            condition: generator => isAngular(generator),
            templates: [
                {
                    file: 'angular/graphql/graphql.module.ts',
                    renameTo: () => `${ANGULAR_DIR}/graphql/graphql.module.ts`
                },
                {
                    file: 'angular/core/util/graphql-util.service.ts',
                    renameTo: () => `${ANGULAR_DIR}/core/util/graphql-util.service.ts`
                },
                {
                    file: 'angular/entities/user/user.gql.service.ts',
                    renameTo: () => `${ANGULAR_DIR}/entities/user/user.gql.service.ts`
                }
            ]
        },
        {
            condition: generator => isAngular(generator) && generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT,
            templates: [
                {
                    file: 'angular/entities/user/user.gql.ts',
                    renameTo: () => `${ANGULAR_DIR}/entities/user/user.gql.ts`
                },
                {
                    file: 'angular/codegen-typescript.yml',
                    renameTo: () => 'codegen.yml'
                }
            ]
        },
        {
            condition: generator => isAngular(generator) && generator.typeDefinition === constants.TYPE_DEFINITION_GRAPHQL,
            templates: [
                {
                    file: 'angular/entities/user/user.graphql',
                    renameTo: () => `${ANGULAR_DIR}/entities/user/user.graphql`
                },
                {
                    file: 'angular/codegen-graphql.yml',
                    renameTo: () => 'codegen.yml'
                }
            ]
        }
    ]
};

function adjustProxyConf(generator) {
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
        fs.writeFileSync(filePath, generatedFileContent.code);
    }
}

function adjustWebpackConfig() {
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
            fs.writeFileSync(filePath, generatedFileContent.code);
        }
    }
}

function adjustTSConfig(generator) {
    const tsConfigJsonStorage = generator.createStorage('tsconfig.json');
    const compilerOptionsStorage = tsConfigJsonStorage.createStorage('compilerOptions');
    const libs = compilerOptionsStorage.get('lib');
    compilerOptionsStorage.set('lib', [...libs, 'esnext.asynciterable']);
    if (generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
        compilerOptionsStorage.set('emitDecoratorMetadata', true);
    }
    tsConfigJsonStorage.save();
}

function addGraphQLModuleToAppModule(generator) {
    const needleClient = new AngularNeedleClient(generator);
    needleClient.addModule('', 'GraphQL', 'graphql', 'graphql', false, null);
}

function adjustAngularFiles(generator) {
    addGraphQLModuleToAppModule(generator);
    adjustProxyConf(generator);
    if (generator.experimentalTransformer) {
        adjustWebpackConfig();
    }
    adjustTSConfig(generator);
}

function adjustPackageJSON(generator) {
    const packageJsonStorage = generator.createStorage('package.json');
    const dependenciesStorage = packageJsonStorage.createStorage('dependencies');
    const devDependenciesStorage = packageJsonStorage.createStorage('devDependencies');
    const scriptsStorage = packageJsonStorage.createStorage('scripts');
    // TODO: versions?
    dependenciesStorage.set('graphql', '15.5.0');
    dependenciesStorage.set('@apollo/client', '3.3.19');
    devDependenciesStorage.set('@graphql-codegen/cli', '1.21.4');
    devDependenciesStorage.set('@graphql-codegen/typescript', '1.22.0');

    if (generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
        dependenciesStorage.set('graphql-typeop', '0.1.0-SNAPSHOTA');
    } else {
        devDependenciesStorage.set('@graphql-codegen/typescript-operations', '1.17.16');
    }

    if (isAngular(generator)) {
        dependenciesStorage.set('apollo-angular', '2.6.0');
        if (generator.typeDefinition === constants.TYPE_DEFINITION_GRAPHQL) {
            devDependenciesStorage.set('@graphql-codegen/typescript-apollo-angular', '2.3.3');
        }
        scriptsStorage.set('webapp:dev', 'concurrently "npm run codegen:watch" "ng serve"');
    }
    scriptsStorage.set('codegen', 'graphql-codegen --config codegen.yml');
    scriptsStorage.set('codegen:watch', 'graphql-codegen --config codegen.yml --watch');
    packageJsonStorage.save();
}

function writeFiles() {
    return {
        writeGraphQLFiles() {
            this.writeFilesToDisk(clientFiles, this, false);
        },
        adjustFiles() {
            if (isAngular(this)) {
                adjustAngularFiles(this);
            }
            adjustPackageJSON(this);
        }
    }
}

module.exports = {
    writeFiles
};
