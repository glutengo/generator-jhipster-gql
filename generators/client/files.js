const babel = require('@babel/core');
const t = require('@babel/types');
const babelGenerator = require('@babel/generator');
const fs = require('fs');
const { Statement } = require('ts-morph');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

const ANGULAR_DIR = jhipsterConstants.ANGULAR_DIR;

const clientFiles = {
    graphQL: [
        {
            condition: generator => generator.clientFramework === 'angularX',
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
                    file: 'angular/entities/user/user.graphql',
                    renameTo: () => `${ANGULAR_DIR}/entities/user/user.graphql`
                },
                {
                    file: 'angular/entities/user/user.gql.service.ts',
                    renameTo: () => `${ANGULAR_DIR}/entities/user/user.gql.service.ts`
                },
                {
                    file: 'angular/codegen.yml',
                    renameTo: () => 'codegen.yml'
                }
            ]
        }
    ]
};

function adjustProxyConf() {
    // read and parse the proxy configuration file
    const filePath = 'webpack/proxy.conf.js';
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsedFileContent = babel.parseSync(fileContent);
    // find the conf assignment in the function declaration
    const fun = parsedFileContent.program.body.find(p => p.type === 'FunctionDeclaration' && p.id && p.id.name === 'setupProxy');
    const confAssignment = fun.body.body.find(s => s.type === 'VariableDeclaration' && s.declarations.find(d => d.type === 'VariableDeclarator' && d.id && d.id.name === 'conf'));
    const confDeclarator = confAssignment.declarations.find(d => d.type === 'VariableDeclarator' && d.id && d.id.name === 'conf')
    const initNode = confDeclarator.init.elements[0];
    const propertyNode = initNode.properties.find(p => p.key && p.key.name === 'context');
    // check if there already is an entry for the graphql endpoint
    const existingGraphQLEntry = propertyNode.value.elements.find(e => e.value === '/graphql');
    if (!existingGraphQLEntry) {
        // if none is found, add it and write the manipulated file
        propertyNode.value.elements.push(t.stringLiteral('/graphql'));
        const generatedFileContent = babelGenerator.default(parsedFileContent, {quotes: 'single'});
        fs.writeFileSync(filePath, generatedFileContent.code);
    }
}

function writeFiles() {
    return {
        writeGraphQLFiles() {
            this.clientFramework = this.getJhipsterConfig().get('clientFramework');
            this.writeFilesToDisk(clientFiles, this, false);
        },
        adjustFiles() {
            adjustProxyConf();
        }
    }
}

module.exports = {
    writeFiles
};
