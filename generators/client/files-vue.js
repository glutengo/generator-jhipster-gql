const { Node } = require('ts-morph');
const babel = require('@babel/core');
const t = require('@babel/types');
const babelGenerator = require('@babel/generator').default;
const fs = require('fs');
const path = require('path');
const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const constants = require('../../utils/constants');
const { adjustProxyConfig } = require('./files-react');
const utils = require('../../utils/commons');

const vueFiles = [
    {
        templates: [
            {
                file: 'vue/entities/user/user.gql.service.ts',
                renameTo: () => `${jHipsterConstants.REACT_DIR}/entities/user/user.gql.service.ts`
            },
            {
                file: 'react/config/apollo-client.ts',
                renameTo: () => `${jHipsterConstants.VUE_DIR}/shared/config/apollo-client.ts`
            }
        ]
    },
    {
        condition: generator => generator.typeDefinition === constants.TYPE_DEFINITION_GRAPHQL,
        templates: [
            {
                file: 'react/webpack/graphql.transformer.js',
                renameTo: () => 'webpack/graphql.transformer.js'
            }
        ]
    }
];

function adjustWebpackConfig(generator) {
    const filePath = path.join('webpack', 'webpack.common.js');
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
    const exportDeclarationIndex = ast.program.body.findIndex(e => e.type === 'ExpressionStatement');
    const exportDeclaration = ast.program.body[exportDeclarationIndex];
    if (exportDeclaration) {
        const optionKey = 'getCustomTransformers';
        const optionValue = babel.parseSync('program => ({ before: [ GraphQLTransformer.default.create(program) ] })').program.body[0].expression;
        const moduleProperty = exportDeclaration.expression.right.arguments[0].properties.find(p => p.key && p.key.name === 'module');
        if (moduleProperty) {
            const tsLoaderRule = moduleProperty.value.properties[0].value.elements.find(
                e =>
                    e.properties &&
                    e.properties.find(
                        p =>
                            p.key &&
                            p.key.name === 'use' &&
                            p.value.elements.find(ve =>
                                ve.properties.find(vep => vep.key.name === 'loader' && vep.value.value === 'ts-loader')
                            )
                    )
            );
            if (tsLoaderRule) {
                const tsLoaderUseEntry = tsLoaderRule.properties
                    .find(p => p.key && p.key.name === 'use')
                    .value.elements.find(ve => ve.properties.find(vep => vep.key.name === 'loader' && vep.value.value === 'ts-loader'));
                const useEntryOptions = tsLoaderUseEntry.properties.find(p => p.key && p.key.name === 'options');
                if (useEntryOptions) {
                    useEntryOptions.value.properties = [
                        useEntryOptions.value.properties[0],
                        t.objectProperty(t.identifier(optionKey), optionValue)
                    ];
                }
                const requireExpression = t.callExpression(t.identifier('require'), [
                    t.stringLiteral('graphql-typeop/transformers/graphql.transformer')
                ]);
                const requireDeclaration = t.variableDeclaration('const', [
                    t.variableDeclarator(t.identifier('GraphQLTransformer'), requireExpression)
                ]);
                ast.program.body.splice(0, 0, requireDeclaration);
            }
        }
        const generatedFileContent = babelGenerator(ast, { quotes: 'single' });
        generator.fs.write(filePath, generatedFileContent.code);
    }
}

function adjustMainTs(tsProject, generator) {
    const filePath = `${jHipsterConstants.VUE_DIR}/main.ts`;
    const content = tsProject.getSourceFile(filePath);
    const serviceName = 'UserGraphQLService'
    const addedImport = utils.addImportIfMissing(content, {
        moduleSpecifier: '@/entities/user/user.gql.service',
        namedImport: serviceName
    }, true);
    if (addedImport) {
        const expressionStatement = content.getStatement(statement => {
            if(Node.isExpressionStatement(statement)) {
                const expression = statement.getExpression();
                return Node.isNewExpression(expression);
            }
        });
        console.log('GOT STH');
        expressionStatement.getExpression()
            .getArguments()[0]
            .getProperty('provide')
            .getInitializer()
            .getProperty('userService')
            .setInitializer(`() => new ${serviceName}()`);
        content.saveSync();
    }
}

function adjustVueFiles(generator) {
    adjustProxyConfig(generator, true);
    const tsProject = utils.getTsProject(generator);
    adjustMainTs(tsProject, generator);
    if (generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
        adjustWebpackConfig(generator);
    }
}

module.exports = {
    vueFiles,
    adjustVueFiles
};
