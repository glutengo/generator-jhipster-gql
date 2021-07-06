const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { writeFiles } = require('./files');
const { askForTypeDefinition, constants } = require('./prompts');
const NeedleClient = require('generator-jhipster/generators/client/needle-api/needle-client-angular');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');

module.exports = class extends BaseGenerator {

    get prompting() {
        return {
            askForTypeDfinition: askForTypeDefinition
        }
    }

    get writing() {
        return writeFiles();
    }

    get postWriting() {
          return {
            installGraphQL() {
                // apollo-angular is installed as described here: https://apollo-angular.com/docs/get-started/
                // running the schematic is not an option here because npm install has not happened yet
                const packageJsonStorage = this.createStorage('package.json');
                const dependenciesStorage = packageJsonStorage.createStorage('dependencies');
                const devDependenciesStorage = packageJsonStorage.createStorage('devDependencies');
                const scriptsStorage = packageJsonStorage.createStorage('scripts');
                if (this.clientFramework === jhipsterConstants.SUPPORTED_CLIENT_FRAMEWORKS.ANGULAR) {
                    // TODO: versions?
                    dependenciesStorage.set('@apollo/client', '3.3.19');
                    dependenciesStorage.set('apollo-angular', '2.6.0');
                    dependenciesStorage.set('graphql', '15.5.0');
                    if (this.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
                        dependenciesStorage.set('graphql-typeop', '0.1.0-SNAPSHOT');
                    }
                    devDependenciesStorage.set('@graphql-codegen/cli', '1.21.4');
                    devDependenciesStorage.set('@graphql-codegen/typescript', '1.22.0');
                    devDependenciesStorage.set('@graphql-codegen/typescript-apollo-angular', '2.3.3');
                    devDependenciesStorage.set('@graphql-codegen/typescript-operations', '1.17.16');

                    scriptsStorage.set('codegen', 'graphql-codegen --config codegen.yml');
                    scriptsStorage.set('codegen:watch', 'graphql-codegen --config codegen.yml --watch');
                    scriptsStorage.set('webapp:dev', 'concurrently "npm run codegen:watch" "ng serve"');

                    packageJsonStorage.save();

                    const tsConfigJsonStorage = this.createStorage('tsconfig.json');
                    const compilerOptionsStorage = tsConfigJsonStorage.createStorage('compilerOptions');
                    const libs = compilerOptionsStorage.get('lib');
                    compilerOptionsStorage.set('lib', [...libs, 'esnext.asynciterable']);
                    if (this.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
                        compilerOptionsStorage.set('emitDecoratorMetadata', true);
                    }
                    tsConfigJsonStorage.save();

                    // import graphQL Module in app module. graphql.module.ts is added via files.js
                    const needleClient = new NeedleClient(this);
                    needleClient.addModule('', 'GraphQL', 'graphql', 'graphql', false, null);
                }
                // TODO: add other implementations for other frameworks
            }

          }
    }
}
