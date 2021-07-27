const babel = require('@babel/core');
const t = require('@babel/types');
const babelGenerator = require('@babel/generator').default;
const fs = require('fs');
const path = require('path');
const constants = require('../../utils/constants');
const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const { adjustProxyConfig } = require('./files-react');

const vueFiles = [
    {
        templates: [
            // TODO: user service for vue gql
            /*{
                file: 'react/modules/administration/user-management/user-management.gql-actions.ts',
                renameTo: () => `${jHipsterConstants.REACT_DIR}/modules/administration/user-management/user-management.gql-actions.ts`
            },*/
            {
                file: 'react/config/apollo-client.ts',
                renameTo:() => `${jHipsterConstants.VUE_DIR}/shared/config/apollo-client.ts`
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
        e => e.type === 'VariableDeclaration' && e.declarations && e.declarations.find(d => d.type === 'VariableDeclarator' && d.id && d.id.name === 'GraphQLTransformer'));
    if (existingGraphQLTransformerImportStatement) {
        return;
    }
    const exportDeclarationIndex = ast.program.body.findIndex(e => e.type === 'ExpressionStatement');
    const exportDeclaration = ast.program.body[exportDeclarationIndex];
    if (exportDeclaration) {
        const optionKey = 'getCustomTransformers'
        const optionValue = babel.parseSync('program => ({ before: [ GraphQLTransformer.create(program) ] })').program.body[0];
        const moduleProperty = exportDeclaration.expression.right.arguments[0].properties.find(p => p.key && p.key.name === 'module');
        if (moduleProperty) {
            const tsLoaderRule = moduleProperty.value.properties[0].value.elements.find(e => e.properties && e.properties.find(p => p.key && p.key.name === 'use')?.value.elements.find(ve => ve.properties.find(vep => vep.key?.name === 'loader' && vep.value.value === 'ts-loader')));
            if (tsLoaderRule) {
                const tsLoaderUseEntry = tsLoaderRule.properties.find(p => p.key && p.key.name === 'use').value.elements.find(ve => ve.properties.find(vep => vep.key?.name === 'loader' && vep.value.value === 'ts-loader'));
                const useEntryOptions = tsLoaderUseEntry.properties.find(p => p.key && p.key.name === 'options');
                if (useEntryOptions) {
                    useEntryOptions.value.properties.push(t.objectProperty(t.identifier(optionKey), optionValue));
                }
                const requireExpression = t.callExpression(t.identifier('require'), [t.stringLiteral('graphql-typeop/transformers/graphql.transformer')]);
                const requireDeclaration = t.variableDeclaration('const', [t.variableDeclarator(t.identifier('GraphQLTransformer'), requireExpression)]);
                ast.program.body.splice(0, 0, requireDeclaration);
            }
        }
        const generatedFileContent = babelGenerator(ast, { quotes: 'single' });
        generator.fs.write(filePath, generatedFileContent.code);
    }
}

function adjustVueFiles(generator) {adjustProxyConfig(generator);
    adjustProxyConfig(generator);
    if (generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
        adjustWebpackConfig(generator);
    }
}

module.exports = {
    vueFiles,
    adjustVueFiles
}
