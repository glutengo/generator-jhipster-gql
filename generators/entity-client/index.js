const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { writeFiles } = require('./files');

module.exports = class extends BaseGenerator {

    initializing() {
        this.entityClass = this.options.entityConfig.entityClass;
        this.entityFileName = this.options.entityConfig.entityFileName;
        this.entityInstance = this.options.entityConfig.entityInstance;
        this.entityFolderName = this.options.entityConfig.entityFolderName;
        this.fields = this.options.entityConfig.fields;
        this.relationships = this.options.entityConfig.relationships;
        this.databaseType = this.options.databaseType;
        this.gqlConfig = this.options.gqlConfig;
        this.clientFramework = this.options.clientFramework;
        this.typeDefinition = this.gqlConfig.typeDefinition;
        this.experimentalDecorators = this.gqlConfig.experimentalDecorators;
    }

    get writing() {
        return {
            ...writeFiles()
        }
    }
}
