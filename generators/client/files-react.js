const babel = require('@babel/core');
const t = require('@babel/types');
const babelGenerator = require('@babel/generator').default;
const fs = require('fs');
const path = require('path');
const constants = require('../generator-gql-constants');

function adjustWebpackConfig() {
    const filePath = path.join('webpack', 'webpack.common.js');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const ast = babel.parseSync(fileContent);
    const getTsLoaderRuleDeclarationIndex = ast.program.body.findIndex(e => e.type === 'VariableDeclaration' && e.declarations[0] && e.declarations[0].id && e.declarations[0].id.name === 'getTsLoaderRule');
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

function adjustProxyConfig(generator) {
    const filePath = path.join('webpack', 'webpack.dev.js');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const ast = babel.parseSync(fileContent);
    const expressionStatementIndex = ast.program.body.findIndex(e => e.type === 'ExpressionStatement' && e.expression.left && e.expression.left.property && e.expression.left.property.name === 'exports');
    const expressionStatement = ast.program.body[expressionStatementIndex];
    if (expressionStatement) {
        const arg = expressionStatement.expression.right.body.arguments.find(a => a.type === 'ObjectExpression');
        const devServer = arg.properties.find(p => p.key.name === 'devServer');
        const proxy = devServer.value.properties.find(p => p.key.name === 'proxy');
        const context = proxy.value.elements[0].properties.find(p => p.key.name === 'context');
        context.value.elements.push(t.stringLiteral(generator.endpoint));
        const generatedFileContent = babelGenerator(ast, { quotes: 'single' });
        generator.fs.write(filePath, generatedFileContent.code);
    }
}

function adjustReactFiles(generator) {
    adjustProxyConfig(generator);
    if (generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
        adjustWebpackConfig();
    }
}

module.exports = {
    adjustReactFiles
}
