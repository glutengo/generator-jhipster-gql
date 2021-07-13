const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const constants = require('../generator-gql-constants');
const { isAngular, isReact, getClientBaseDir } = require('../util');
const { adjustAngularFiles } = require('./files-angular');
const { adjustReactFiles } = require('./files-react');

const ANGULAR_DIR = jhipsterConstants.ANGULAR_DIR;

const clientFiles = {
    common: [
        {
            templates: [
                {
                    file: 'common/codegen.yml',
                    renameTo: () => 'codegen.yml'
                }
            ]
        },
        {
            condition: generator => generator.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT,
            templates: [
                {
                    file: 'common/entities/user/user.gql.ts',
                    renameTo: generator => `${getClientBaseDir(generator)}/entities/user/user.gql.ts`
                }
            ]
        },
        {
            condition: generator => generator.typeDefinition === constants.TYPE_DEFINITION_GRAPHQL,
            templates: [
                {
                    file: 'common/entities/user/user.graphql',
                    renameTo: generator => `${getClientBaseDir(generator)}/entities/user/user.graphql`
                }
            ]
        }

    ],
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
        }
    ],
    react: [
        {
            condition: generator => isReact(generator) && generator.typeDefinition === constants.TYPE_DEFINITION_GRAPHQL,
            templates: [
                {
                    file: 'react/webpack/graphql.transformer.js',
                    renameTo: () => 'webpack/graphql.transformer.js'
                }
            ]
        }
    ]
};

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
    if (isReact(generator)) {
        if (generator.typeDefinition === constants.TYPE_DEFINITION_GRAPHQL) {
            devDependenciesStorage.set('@graphql-codegen/typescript-react-apollo', '2.3.0');
        }
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
            if (isReact(this)) {
                adjustReactFiles(this);
            }
            adjustPackageJSON(this);
        }
    }
}

module.exports = {
    writeFiles
};
