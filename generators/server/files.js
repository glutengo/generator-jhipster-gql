const nodejsConstants = require('generator-jhipster-nodejs/generators/generator-nodejs-constants');
const utils = require('../../utils/commons');
const constants = require('../../utils/constants');

module.exports = {
    writeFiles
};

const serverFiles = {
    graphQL: [
        {
            templates: [
                'server/src/module/graphql.module.ts',
                'server/src/service/graphql/paginated.object-type.ts',
                'server/src/service/graphql/user.input-type.ts',
                'server/src/service/graphql/user.object-type.ts',
                'server/src/service/graphql/pub-sub.service.ts',
                'server/src/web/graphql/field-resolver-util.ts',
                'server/src/web/graphql/pagination-util.ts',
                'server/src/web/graphql/user.resolver.ts',
                'server/src/security/guards/auth.guard.ts',
                'server/src/security/decorators/auth-user.decorator.ts',
                'server/scripts/build-schema.ts'
            ]
        }
    ]
};

function adjustAppModule(generator, tsProject) {
    const filePath = `${nodejsConstants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`;
    const appModule = tsProject.getSourceFile(filePath);
    const graphQLModuleIdentifier = 'GraphQLModule';

    // add TypeScript module imports
    const added = utils.addImportIfMissing(appModule, { moduleSpecifier: './module/graphql.module', namedImport: graphQLModuleIdentifier });

    if (added) {
        // add NestJS module import
        const _class = appModule.getClass(() => true);
        const moduleDecorator = _class.getDecorator('Module');
        const moduleImports = moduleDecorator.getArguments()[0].getProperty('imports').getInitializer();
        moduleImports.insertElement(moduleImports.getElements().length - 1, graphQLModuleIdentifier);
        appModule.saveSync();
    }
}

function adjustUserModule(tsProject) {
    const filePath = `${nodejsConstants.SERVER_NODEJS_SRC_DIR}/src/module/user.module.ts`;
    const userModule = tsProject.getSourceFile(filePath);

    // add TypeScript module imports
    const added = utils.addImportIfMissing(userModule, { moduleSpecifier: '../web/graphql/user.resolver', namedImport: 'UserResolver' });

    if (added) {
        // add User resolver to providers
        const _class = userModule.getClass(() => true);
        const moduleDecorator = _class.getDecorator('Module');
        const moduleProviders = moduleDecorator.getArguments()[0].getProperty('providers').getInitializer();
        moduleProviders.addElement('UserResolver');
    }
    userModule.saveSync();
}

function adjustUserService(tsProject) {
    const filePath = `${nodejsConstants.SERVER_NODEJS_SRC_DIR}/src/service/user.service.ts`;
    const userService = tsProject.getSourceFile(filePath);

    // add TypeScript module imports
    const added = utils.addImportIfMissing(userService, { moduleSpecifier: './graphql/pub-sub.service', namedImport: 'PubSubService' });

    if (added) {
        const _class = userService.getClass(() => true);
        // add pubSub to constructor
        const constructor = _class.getConstructors()[0];
        constructor.addParameter({ name: 'private pubSub', type: 'PubSubService' });
        const statement = arg => `this.pubSub.publish('users', ${arg})`;
        // use pub sub in save, update and delete
        const _save = _class.getMethod('save');
        const _update = _class.getMethod('update');
        const _delete = _class.getMethod('delete');
        _save.insertStatements(_save.getChildSyntaxList().getChildCount() - 1, statement('result.id'));
        _update.insertStatements(_update.getChildSyntaxList().getChildCount() - 1, statement('userDTO.id'));
        _delete.insertStatements(_delete.getChildSyntaxList().getChildCount() - 1, statement('user.id'));
        userService.saveSync();
    }
}

function adjustBaseDTO(tsProject) {
    const filePath = `${nodejsConstants.SERVER_NODEJS_SRC_DIR}/src/service/dto/base.dto.ts`;
    const dto = tsProject.getSourceFile(filePath);

    // add graphql module imports
    const addedFieldImport = utils.addImportIfMissing(dto, { moduleSpecifier: '@nestjs/graphql', namedImport: 'Field' })
    const addedInputTypeImport = utils.addImportIfMissing(dto, { moduleSpecifier: '@nestjs/graphql', namedImport: 'InputType' })
    const addedObjectTypeImport = utils.addImportIfMissing(dto, { moduleSpecifier: '@nestjs/graphql', namedImport: 'ObjectType' });
    const added = addedFieldImport || addedInputTypeImport || addedObjectTypeImport;

    if (added) {
        // add class decorators
        const _class = dto.getClass(() => true);
        _class.addDecorator({ name: 'ObjectType', arguments: ['{ isAbstract: true }'] });
        _class.addDecorator({ name: 'InputType', arguments: ['{ isAbstract: true }'] });
        // add id decorator
        _class.getInstanceProperty('id').addDecorator({ name: 'Field', arguments: ['{nullable: false}'] });
    }
    dto.saveSync();
}

function adjustUserDTO(tsProject) {
    const filePath = `${nodejsConstants.SERVER_NODEJS_SRC_DIR}/src/service/dto/user.dto.ts`;
    const dto = tsProject.getSourceFile(filePath);

    const addedInputTypeImport = utils.addImportIfMissing(dto, { moduleSpecifier: '@nestjs/graphql', namedImport: 'InputType' })
    const addedObjectTypeImport = utils.addImportIfMissing(dto, { moduleSpecifier: '@nestjs/graphql', namedImport: 'ObjectType' });
    const addedHideFieldImport = utils.addImportIfMissing(dto, { moduleSpecifier: '@nestjs/graphql', namedImport: 'HideField' });
    const added = addedInputTypeImport || addedObjectTypeImport || addedHideFieldImport;

    if (added) {
        // add class decorators
        const _class = dto.getClass(() => true);
        _class.addDecorator({ name: 'ObjectType', arguments: ['{ isAbstract: true }'] });
        _class.addDecorator({ name: 'InputType', arguments: ['{ isAbstract: true }'] });
        // adjust type of authorities
        _class.getInstanceProperty('authorities').setType('string[]');
        // add password decorator
        _class.getInstanceProperty('password').addDecorator({ name: 'HideField', arguments: [] });
    }
    dto.saveSync();
}

/**
 * Adjust package JSON: Install libraries and adjust build / dev scripts
 *
 * @param generator The Yeoman generators
 */
function adjustPackageJSON(generator) {
    const packageJSONStorage = generator.createStorage('server/package.json');
    const dependenciesStorage = packageJSONStorage.createStorage('dependencies');
    const dependabotPackageJSON = utils.getDependabotPackageJSON(generator, true);

    dependenciesStorage.set('@nestjs/graphql', dependabotPackageJSON.dependencies['@nestjs/graphql']);
    dependenciesStorage.set('graphql', dependabotPackageJSON.dependencies.graphql);
    dependenciesStorage.set('graphql-tools', dependabotPackageJSON.dependencies['graphql-tools']);
    dependenciesStorage.set('graphql-subscriptions', dependabotPackageJSON.dependencies['graphql-subscriptions']);
    dependenciesStorage.set('apollo-server-express', dependabotPackageJSON.dependencies['apollo-server-express']);

    const scriptsStorage = packageJSONStorage.createStorage('scripts');
    scriptsStorage.set('start:dev', 'npm run copy-resources && nest start -w');
    scriptsStorage.set('start:nest', 'npm run copy-resources && nest start');
    scriptsStorage.set('build:schema-gql', 'ts-node scripts/build-schema.ts');
    packageJSONStorage.save();
}
function adjustNestCLIJSON(generator) {
    const nestCLIJSONStorage = generator.createStorage('server/nest-cli.json');
    const compilerOptions = nestCLIJSONStorage.get('compilerOptions') || {};
    if (!compilerOptions.plugins) {
        compilerOptions.plugins = [];
    }
    if (!compilerOptions.plugins.find(p => p.name === constants.NESTJS_GRAPHQL_PLUGIN)) {
        const nestCLIPlugin = {
            name: constants.NESTJS_GRAPHQL_PLUGIN,
            options: {
                typeFileNameSuffix: ['.dto.ts', '.entity.ts', '.input-type.ts', '.object-type.ts']
            }
        };
        compilerOptions.plugins.push(nestCLIPlugin);
        nestCLIJSONStorage.set('compilerOptions', compilerOptions);
        nestCLIJSONStorage.save();
    }
}

function writeFiles() {
    return {
        adjustConfigFiles() {
            adjustPackageJSON(this);
            adjustNestCLIJSON(this);
        },
        writeGraphQLFiles() {
            this.writeFilesToDisk(serverFiles, this, false);
        },
        adjustTypeScriptFiles() {
            const tsProject = utils.getTsProject(this, true);
            adjustAppModule(this, tsProject);
            adjustUserModule(tsProject);
            adjustUserService(tsProject);
            adjustBaseDTO(tsProject);
            adjustUserDTO(tsProject);
        }
    };
}
