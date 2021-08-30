const constants = require('../../utils/constants');
const { isAngular, isReact, isVue, getClientBaseDir } = require('../../utils/commons');
const { adjustAngularFiles, angularFiles } = require('./files-angular');
const { adjustReactFiles, reactFiles } = require('./files-react');
const { vueFiles, adjustVueFiles } = require('./files-vue');

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
                    file: 'common/graphql/graphql.common-types.ts',
                    renameTo: generator => `${getClientBaseDir(generator)}/graphql/graphql.common-types.ts`
                },
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
        dependenciesStorage.set('graphql-typeop', '0.2.0-SNAPSHOTG');
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
    if (generator.typeDefinition === constants.TYPE_DEFINITION_GRAPHQL) {
        devDependenciesStorage.set('@graphql-codegen/typescript-operations', '1.17.16');
    }
    if (isReact(generator) || isVue(generator)) {
        if (generator.typeDefinition === constants.TYPE_DEFINITION_GRAPHQL) {
            devDependenciesStorage.set('@graphql-codegen/typescript-react-apollo', '2.3.0');
        }
        scriptsStorage.set('webapp:dev', 'concurrently "npm run codegen:watch" "npm run webpack-dev-server -- --config webpack/webpack.dev.js --inline --port=9060 --env stats=minimal"');
        scriptsStorage.set('webapp:build:dev', 'npm run codegen && npm run webpack -- --config webpack/webpack.dev.js --env stats=minimal');
        scriptsStorage.set('webapp:build:prod', 'npm run codegen && npm run webpack -- --config webpack/webpack.prod.js --progress=profile');
    }
    scriptsStorage.set('codegen', 'graphql-codegen --config codegen.yml');
    scriptsStorage.set('codegen:watch', 'graphql-codegen --config codegen.yml --watch');
    packageJsonStorage.save();
}

function writeFiles() {
    return {
        writeGraphQLFiles() {
            const files = { ...clientFiles };
            if (isAngular(this)) {
                files.angular = angularFiles;
            }
            if (isReact(this)) {
                files.react = reactFiles;
            }
            if (isVue(this)) {
                files.vue = vueFiles;
            }
            this.writeFilesToDisk(files, this, false);
        },
        adjustFiles() {
            if (isAngular(this)) {
                adjustAngularFiles(this);
            }
            if (isReact(this)) {
                adjustReactFiles(this);
            }
            if (isVue(this)) {
                adjustVueFiles(this);
            }
            adjustPackageJSON(this);
        }
    };
}

module.exports = {
    writeFiles
};
