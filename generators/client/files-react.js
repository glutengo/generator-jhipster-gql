const babel = require('@babel/core');
const t = require('@babel/types');
const babelGenerator = require('@babel/generator').default;
const fs = require('fs');
const path = require('path');
const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const constants = require('../../utils/constants');
const utils = require('../../utils/commons');

const reactFiles = [
    {
        templates: [
            {
                file: 'react/modules/administration/user-management/user-management.gql-actions.ts',
                renameTo: () => `${jHipsterConstants.REACT_DIR}/modules/administration/user-management/user-management.gql-actions.ts`
            },
            {
                file: 'common/config/apollo-client.ts',
                renameTo: () => `${jHipsterConstants.REACT_DIR}/config/apollo-client.ts`
            },
            {
                file: 'common/core/util/pub-sub.ts',
                renameTo: () => `${jHipsterConstants.REACT_DIR}/shared/util/pub-sub.ts`
            },
            {
                file: 'common/core/util/graphql-cache-watcher.ts',
                renameTo: () => `${jHipsterConstants.ANGULAR_DIR}/shared/util/graphql-cache-watcher.ts`
            }
        ]
    },
    {
        condition: generator => generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT,
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
    const getTsLoaderRuleDeclarationIndex = ast.program.body.findIndex(
        e =>
            e.type === 'VariableDeclaration' && e.declarations[0] && e.declarations[0].id && e.declarations[0].id.name === 'getTsLoaderRule'
    );
    const getTsLoaderRuleDeclaration = ast.program.body[getTsLoaderRuleDeclarationIndex];
    if (getTsLoaderRuleDeclaration) {
        const rulesDeclaration = babel.parseSync(`
const rules = [
  {
    loader: 'ts-loader',
    options: {
      getCustomTransformers: path.resolve(__dirname, './graphql.transformer.js')
    }
  }
]`).program.body[0];
        getTsLoaderRuleDeclaration.declarations[0].init.body.body[0] = rulesDeclaration;
        const generatedFileContent = babelGenerator(ast, { quotes: 'single' });
        generator.fs.write(filePath, generatedFileContent.code);
    }
}

/**
 * Adds an for the GraphQL endpoint to the proxy configuration
 *
 * @param generator The Yeoman generator
 * @param vue The method can also be called for vue, in this case, this parameter is to be passed as true
 */
function adjustProxyConfig(generator, vue = false) {
    const filePath = path.join('webpack', 'webpack.dev.js');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const ast = babel.parseSync(fileContent);
    const expressionStatementIndex = ast.program.body.findIndex(
        e =>
            e.type === 'ExpressionStatement' &&
            e.expression.left &&
            e.expression.left.property &&
            e.expression.left.property.name === 'exports'
    );
    const expressionStatement = ast.program.body[expressionStatementIndex];
    if (expressionStatement) {
        const args = vue ? expressionStatement.expression.right.arguments : expressionStatement.expression.right.body.arguments;
        const arg = args.find(a => a.type === 'ObjectExpression');
        const devServer = arg.properties.find(p => p.key.name === 'devServer');
        const proxy = devServer.value.properties.find(p => p.key.name === 'proxy');
        const context = proxy.value.elements[0].properties.find(p => p.key.name === 'context');
        context.value.elements.push(t.stringLiteral(generator.endpoint));
        proxy.value.elements.push(utils.getWSProxyDeclaration(generator.getJhipsterConfig().get(OptionNames.SERVER_PORT), vue ? 'vue' : 'react'));

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

function adjustReactFiles(generator) {
    adjustProxyConfig(generator);
    if (generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
        adjustWebpackConfig(generator);
    }
}

module.exports = {
    reactFiles,
    adjustReactFiles,
    adjustProxyConfig
};
