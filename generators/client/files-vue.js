const babel = require('@babel/core');
const t = require('@babel/types');
const babelGenerator = require('@babel/generator').default;
const fs = require('fs');
const path = require('path');
const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const constants = require('../../utils/constants');
const { adjustProxyConfig } = require('./files-react');
const utils = require('../../utils/commons');
const { connectCacheWatcherOnCreated } = require('../../utils/vue');

const vueFiles = [
    {
        templates: [
            {
                file: 'vue/entities/user/user.gql.service.ts',
                renameTo: () => `${jHipsterConstants.REACT_DIR}/entities/user/user.gql.service.ts`
            },
            {
                file: 'common/config/apollo-client.ts',
                renameTo: () => `${jHipsterConstants.VUE_DIR}/shared/config/apollo-client.ts`
            },
            {
                file: 'common/core/util/pub-sub.ts',
                renameTo: () => `${jHipsterConstants.VUE_DIR}/core/util/pub-sub.ts`
            },
            {
                file: 'common/core/util/graphql-cache-watcher.ts',
                renameTo: () => `${jHipsterConstants.VUE_DIR}/core/util/graphql-cache-watcher.ts`
            },
            {
                file: 'vue/shared/graphql/graphql.util.ts',
                renameTo: () => `${jHipsterConstants.VUE_DIR}/shared/graphql/graphql.util.ts`
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

/**
 * Adds the GraphQL TypeScript transformer
 *
 * @param generator The Yeoman generator
 */
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
    if (existingGraphQLTransformerImportStatement) return;
    const exportDeclarationIndex = ast.program.body.findIndex(e => e.type === 'ExpressionStatement');
    const exportDeclaration = ast.program.body[exportDeclarationIndex];
    if (!exportDeclaration) return;
    const optionKey = 'getCustomTransformers';
    const optionValue = babel.parseSync('program => ({ before: [ GraphQLTransformer.default.create(program) ] })').program.body[0]
        .expression;
    const moduleProperty = exportDeclaration.expression.right.arguments[0].properties.find(p => p.key && p.key.name === 'module');
    if (!moduleProperty) return;
    const tsLoaderRule = moduleProperty.value.properties[0].value.elements.find(
        e =>
            e.properties &&
            e.properties.find(
                p =>
                    p.key &&
                    p.key.name === 'use' &&
                    p.value.elements.find(ve => ve.properties.find(vep => vep.key.name === 'loader' && vep.value.value === 'ts-loader'))
            )
    );
    if (!tsLoaderRule) return;
    const tsLoaderUseEntry = tsLoaderRule.properties
        .find(p => p.key && p.key.name === 'use')
        .value.elements.find(ve => ve.properties.find(vep => vep.key.name === 'loader' && vep.value.value === 'ts-loader'));
    const useEntryOptions = tsLoaderUseEntry.properties.find(p => p.key && p.key.name === 'options');
    if (useEntryOptions) {
        useEntryOptions.value.properties = [useEntryOptions.value.properties[0], t.objectProperty(t.identifier(optionKey), optionValue)];
    }
    const requireExpression = t.callExpression(t.identifier('require'), [
        t.stringLiteral('graphql-typeop/transformers/graphql.transformer')
    ]);
    const requireDeclaration = t.variableDeclaration('const', [
        t.variableDeclarator(t.identifier('GraphQLTransformer'), requireExpression)
    ]);
    ast.program.body.splice(0, 0, requireDeclaration);
    const generatedFileContent = babelGenerator(ast, { quotes: 'single' });
    generator.fs.write(filePath, generatedFileContent.code);
}

/**
 * Adjusts the main entry point so that GraphQL is activated for the user entity
 *
 * @param tsProject The ts-morph project
 */
function adjustMainTs(tsProject) {
    connectCacheWatcherOnCreated(tsProject);
}

/**
 * Adjusts the user management component so that the bypassCache parameter is used
 *
 * @param generator The Yeoman generator
 */
function adjustUserManagement(generator) {
    const tsProject = utils.getTsProject(generator);
    const filePath = `${jHipsterConstants.VUE_DIR}/admin/user-management/user-management.component.ts`;
    const component = tsProject.getSourceFile(filePath);
    const componentClass = component.getClass(() => true);
    if (componentClass) {
        const loadAll = componentClass.getMethod('loadAll');
        if (loadAll && loadAll.getParameters().length === 0) {
            loadAll.addParameter({ name: 'bypassCache', type: 'boolean', hasQuestionToken: true });
            const call = utils.getFunctionCall(loadAll, 'retrieve');
            const objectLiteralExpression = call.getArguments()[0];
            if (objectLiteralExpression) {
                objectLiteralExpression.addShorthandPropertyAssignment({ name: 'bypassCache' });
                const handleSyncList = componentClass.getMethod('handleSyncList');
                if (handleSyncList) {
                    const loadAllCall = utils.getFunctionCall(handleSyncList, 'loadAll');
                    if (loadAllCall && loadAllCall.getArguments().length === 0) {
                        loadAllCall.addArgument('true');
                        component.saveSync();
                    }
                }
            }
        }
    }
}

function adjustVueFiles(generator) {
    adjustProxyConfig(generator, true);
    const tsProject = utils.getTsProject(generator);
    adjustMainTs(tsProject);
    if (generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
        adjustWebpackConfig(generator);
    }
    adjustUserManagement(generator);
}

module.exports = {
    vueFiles,
    adjustVueFiles
};
