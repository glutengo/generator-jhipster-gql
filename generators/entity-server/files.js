const utils = require('../../utils/commons');

module.exports = {
    writeFiles
};

const serverFiles = {
    graphQL: [
        {
            templates: [
                {
                    file: 'web/graphql/entity.resolver.ts',
                    renameTo: generator => `server/src/web/graphql/${generator.entityFileName}.resolver.ts`
                },
                {
                    file: 'service/graphql/entity.object-type.ts',
                    renameTo: generator => `server/src/service/graphql/${generator.entityFileName}.object-type.ts`
                }
            ]
        }
    ]
}

function adjustEntityModule(generator) {
    const entityModule = utils.getSourceFile(generator.tsProject, `src/module/${generator.entityFileName}.module.ts`, true);
    const added = utils.addImportIfMissing(entityModule, {moduleSpecifier: `../web/graphql/${generator.entityFileName}.resolver`, namedImport: `${generator.entityClass}Resolver`});
    if (added) {
        // add Entity resolver to providers
        const _class = entityModule.getClass(() => true);
        const moduleDecorator = _class.getDecorator('Module');
        const moduleProviders = moduleDecorator.getArguments()[0].getProperty('providers').getInitializer();
        moduleProviders.addElement(`${generator.entityClass}Resolver`);
    }
    entityModule.saveSync();
}

function adjustEntityDTO(generator) {
    const dto = utils.getSourceFile(generator.tsProject, `src/service/dto/${generator.entityFileName}.dto.ts`, true);
    const addedInputTypeImport = utils.addImportIfMissing(dto, {moduleSpecifier: '@nestjs/graphql', namedImport: 'InputType'});
    const addedObjectTypeImport = utils.addImportIfMissing(dto, {moduleSpecifier: '@nestjs/graphql', namedImport: 'ObjectType'});
    const added = addedInputTypeImport || addedObjectTypeImport;

    if (added) {
        // add class decorators
        const _class = dto.getClass(() => true);
        _class.addDecorator({ name: 'ObjectType', arguments: [] });
        _class.addDecorator({ name: 'InputType', arguments: [ `'${generator.entityInstance}'` ] });
    }
    dto.saveSync();
}

function writeFiles() {
    return {
        graphQLEntityFiles() {
            this.writeFilesToDisk(serverFiles, this, false);
        },
        adjustEntityFiles() {
            this.tsProject = utils.getTsProject(this, true);
            adjustEntityModule(this);
            adjustEntityDTO(this);
        }
    }
}
