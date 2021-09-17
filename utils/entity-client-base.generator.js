const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { prepareEntityForTemplates } = require('generator-jhipster/utils/entity');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const { capitalize } = require('./commons');

/**
 * EntityClientBaseGenerator to use along with a single entity
 */
class EntityClientBaseGenerator extends BaseGenerator {
    constructor(args, opts) {
        super(args, opts);
        // single argument: the name of the entity
        this.argument('name', {
            type: String,
            required: true,
            description: 'Entity name'
        });

        const name = capitalize(this.options.name).replace('.json', '');
        if (name === 'User') {
            this.options.entityConfig = this._getUserEntityConfig();
        } else {
            this.options.entityConfig = this.getEntityConfig(name, true).getAll();
            prepareEntityForTemplates(this.options.entityConfig, this);
        }
    }

    _getUserEntityConfig() {
        const entityName = 'user';
        return {
            name: entityName,
            entityClass: capitalize(entityName),
            entityFileName: entityName,
            entityFolderName: entityName
        };
    }

    initializing() {
        this.entityClass = this.options.entityConfig.entityClass;
        this.entityFileName = this.options.entityConfig.entityFileName;
        this.entityFolderName = this.options.entityConfig.entityFolderName;
        this.entityName = this.options.entityConfig.name;
        this.clientFramework = this.config.get(OptionNames.CLIENT_FRAMEWORK);
    }
}

module.exports = EntityClientBaseGenerator;
