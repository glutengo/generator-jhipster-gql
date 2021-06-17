const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { writeFiles } = require('./files');

module.exports = class extends BaseGenerator {
    get writing() {
        return writeFiles();
    }

    get postWriting() {
        return {
            adjustPackageJSON() {
                // TODO: check if nodejs and add other implementations for other frameworks
                const packageJSONStorage = this.createStorage('server/package.json');
                const dependenciesStorage = packageJSONStorage.createStorage('dependencies');
                // TODO: versions?
                dependenciesStorage.set('@nestjs/graphql', '7.10.6');
                dependenciesStorage.set('graphql', '15.5.0');
                dependenciesStorage.set('graphql-tools', '7.0.5');
                dependenciesStorage.set('apollo-server-express', '2.24.0');
                const scriptsStorage = packageJSONStorage.createStorage('scripts');
                scriptsStorage.set('start:dev', 'npm run copy-resources && nest start -w');
                packageJSONStorage.save();
            },
            adjustNestCLIJSON() {
                const nestCLIJSONStorage = this.createStorage('server/nest-cli.json');
                const nestCLIPlugin ={
                    name: '@nestjs/graphql',
                    options: {
                        typeFileNameSuffix: [
                            '.dto.ts',
                            '.entity.ts'
                        ]
                    }
                };
                const compilerOptions = nestCLIJSONStorage.get('compilerOptions') || {};
                if (!compilerOptions.plugins) {
                    compilerOptions.plugins = [];
                }
                compilerOptions.plugins.push(nestCLIPlugin);
                nestCLIJSONStorage.set('compilerOptions', compilerOptions);
                nestCLIJSONStorage.save();
            }
        }
    }
}
