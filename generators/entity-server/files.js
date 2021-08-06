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
};

function adjustEntityModule(generator) {
    const entityModule = utils.getSourceFile(generator.tsProject, `src/module/${generator.entityFileName}.module.ts`, true);
    const added = utils.addImportIfMissing(entityModule, {
        moduleSpecifier: `../web/graphql/${generator.entityFileName}.resolver`,
        namedImport: `${generator.entityClass}Resolver`
    });
    if (added) {
        // add Entity resolver to providers
        const _class = entityModule.getClass(() => true);
        const moduleDecorator = _class.getDecorator('Module');
        const moduleProviders = moduleDecorator
            .getArguments()[0]
            .getProperty('providers')
            .getInitializer();
        moduleProviders.addElement(`${generator.entityClass}Resolver`);
    }
    entityModule.saveSync();
}

function adjustEntityService(generator) {
    const entityService = utils.getSourceFile(generator.tsProject, `src/service/${generator.entityFileName}.service.ts`, true);
    const added = utils.addImportIfMissing(entityService, { moduleSpecifier: './graphql/pub-sub.service', namedImport: 'PubSubService' });
    utils.addImportIfMissing(entityService, { moduleSpecifier: './graphql/pub-sub.service', namedImport: 'PubSubAction' });

    if (added) {
        const _class = entityService.getClass(() => true);
        // add pubSub to constructor
        const constructor = _class.getConstructors()[0];
        constructor.addParameter({ name: 'private pubSub', type: 'PubSubService' });
        // use pub sub in save, update and delete
        const _save = _class.getMethod('save');
        const _update = _class.getMethod('update');
        const _delete = _class.getMethod('deleteById');
        _save.insertStatements(
            _save.getChildSyntaxList().getChildCount() - 1,
            `this.pubSub.publish('${generator.entityInstance}', PubSubAction.ADD, result)`
        );
        _update.insertStatements(
            _update.getChildSyntaxList().getChildCount() - 1,
            `this.pubSub.publish('${generator.entityInstance}', PubSubAction.UPDATE, entity)`
        );
        _delete.insertStatements(
            _delete.getChildSyntaxList().getChildCount() - 1,
            `this.pubSub.publish('${generator.entityInstance}', PubSubAction.DELETE, id)`
        );
        entityService.saveSync();
    }
}

function adjustEntityDTO(generator) {
    const dto = utils.getSourceFile(generator.tsProject, `src/service/dto/${generator.entityFileName}.dto.ts`, true);
    const addedInputTypeImport = utils.addImportIfMissing(dto, { moduleSpecifier: '@nestjs/graphql', namedImport: 'InputType' });
    const addedObjectTypeImport = utils.addImportIfMissing(dto, { moduleSpecifier: '@nestjs/graphql', namedImport: 'ObjectType' });
    const added = addedInputTypeImport || addedObjectTypeImport;

    if (added) {
        // add class decorators
        const _class = dto.getClass(() => true);
        _class.addDecorator({ name: 'ObjectType', arguments: [] });
        _class.addDecorator({ name: 'InputType', arguments: [`'_${generator.entityClass}'`] });
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
            adjustEntityService(this);
            adjustEntityDTO(this);
        }
    };
}
