const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { requiredDefaultConfig } = require('generator-jhipster/generators/generator-defaults');
const { writeFiles } = require('./files');

module.exports = class extends BaseGenerator {

    initializing() {
        this.entityClass = this.options.entityConfig.entityClass;
        this.entityFileName = this.options.entityConfig.entityFileName;
        this.entityInstance = this.options.entityConfig.entityInstance;
        this.databaseType = this.config.get('databaseType');
    }

    get writing() {
        return {
            ...writeFiles()
        }
    }
}
