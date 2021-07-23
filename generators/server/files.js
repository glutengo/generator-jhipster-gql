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
                'server/src/service/graphql/paginated.object-type.ts',
                'server/src/service/graphql/user.object-type.ts',
                'server/src/web/graphql/pagination-util.ts',
                'server/src/web/graphql/user.resolver.ts',
                'server/scripts/build-schema.ts'
            ]
        }
    ]
};

function adjustAppModule(generator, tsProject) {
    const filePath = `${nodejsConstants.SERVER_NODEJS_SRC_DIR}/src/app.module.ts`;
    const appModule = tsProject.getSourceFile(filePath);

    // add TypeScript module imports
    const added = utils.addImportIfMissing(appModule, { moduleSpecifier: '@nestjs/graphql', namedImport: 'GraphQLModule' })
    utils.addImportIfMissing(appModule, { moduleSpecifier: 'path', namedImport: 'join' });

    if (added) {
        // add NestJS module import
        const _class = appModule.getClass(() => true);
        const moduleDecorator = _class.getDecorator('Module');
        const moduleImports = moduleDecorator.getArguments()[0].getProperty('imports').getInitializer();
        const graphQLimportAssignment =
            `GraphQLModule.forRoot({
    installSubscriptionHandlers: true,
    autoSchemaFile: join(process.cwd(), '${generator[constants.CONFIG_KEY_SCHEMA_LOCATION]}'),
    buildSchemaOptions: {
        numberScalarMode: 'integer'
    }
})`;
        moduleImports.insertElement(moduleImports.getElements().length - 1, graphQLimportAssignment);
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
        _class.addDecorator({ name: 'ObjectType', arguments: [] });
        _class.addDecorator({ name: 'InputType', arguments: [] });
        // add id decorator
        _class.getInstanceProperty('id').addDecorator({ name: 'Field', arguments: [`{nullable: false}`] });
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
        _class.addDecorator({ name: 'ObjectType', arguments: [] });
        _class.addDecorator({ name: 'InputType', arguments: [`'_User'`] });
        // adjust type of authorities
        _class.getInstanceProperty('authorities').setType(`string[]`);
        // add password decorator
        _class.getInstanceProperty('password').addDecorator({ name: 'HideField', arguments: [] });

    }
    dto.saveSync();
}

function adjustPackageJSON(generator) {
    const packageJSONStorage = generator.createStorage('server/package.json');
    const dependenciesStorage = packageJSONStorage.createStorage('dependencies');
    // TODO: versions?
    dependenciesStorage.set('@nestjs/graphql', '7.10.6');
    dependenciesStorage.set('graphql', '15.5.0');
    dependenciesStorage.set('graphql-tools', '7.0.5');
    dependenciesStorage.set('apollo-server-express', '2.24.0');
    const scriptsStorage = packageJSONStorage.createStorage('scripts');
    scriptsStorage.set('start:dev', 'npm run copy-resources && nest start -w');
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
                typeFileNameSuffix: [
                    '.dto.ts',
                    '.entity.ts'
                ]
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
            adjustBaseDTO(tsProject);
            adjustUserDTO(tsProject);
        }
    }
}
