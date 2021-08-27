const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const { writeFiles } = require('./files');

module.exports = class extends BaseGenerator {

    initializing() {
        this.entityClass = this.options.entityConfig.entityClass;
        this.entityFileName = this.options.entityConfig.entityFileName;
        this.entityInstance = this.options.entityConfig.entityInstance;
        this.relationships = this.options.entityConfig.relationships;
        this.fields = this.options.entityConfig.fields;
        this.databaseType = this.config.get(OptionNames.DATABASE_TYPE);
    }

    get writing() {
        return {
            ...writeFiles()
        }
    }
}
