const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const pluralize = require('pluralize');

/**
 * Prepares a generator so that all entity information is loaded
 *
 * @param generator The Yeoman generator
 */
function prepareEntitySubGenerator(generator) {
    generator.clientPackageManager = generator.getJhipsterConfig().get(OptionNames.CLIENT_PACKAGE_MANAGER);
    generator.entityClass = generator.options.entityConfig.entityClass;
    generator.entityName = generator.options.entityConfig.name;
    generator.entityNamePlural = generator.upperFirstCamelCase(pluralize(generator.entityName));
    generator.entityInstance = generator.options.entityConfig.entityInstance;
    generator.entityInstancePlural = pluralize(generator.entityInstance);

    generator.entityFileName = generator.options.entityConfig.entityFileName;
    generator.entityFolderName = generator.options.entityConfig.entityFolderName;
    generator.entityModelFileName = generator.options.entityConfig.entityModelFileName;


    generator.fields = generator.options.entityConfig.fields;
    generator.relationships = generator.options.entityConfig.relationships;
    generator.databaseType = generator.config.get(OptionNames.DATABASE_TYPE);
}

module.exports = {
    prepareEntitySubGenerator
};
