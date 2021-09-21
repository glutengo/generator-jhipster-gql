const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { prepareEntitySubGenerator } = require('../../utils/entity');

const { writeFiles } = require('./files');

module.exports = class extends BaseGenerator {
    /**
     * Initializes the generator by reading the configuration
     */
    get initializing() {
        return {
            prepare() {
                prepareEntitySubGenerator(this);
                this.entityAngularName = this.entityClass + this.upperFirstCamelCase(this.options.entityConfig.entityAngularJSSuffix);
                this.gqlConfig = this.options.gqlConfig;
                this.clientFramework = this.options.clientFramework;
                this.typeDefinition = this.gqlConfig.typeDefinition;
            }
        };
    }

    /**
     * Writes the entity client files
     */
    get writing() {
        return {
            ...writeFiles()
        };
    }

    /**
     * Runs the entity-client-enable and generates the client typing information
     */
    get end() {
        return {
            end() {
                this.composeWith(require.resolve('../entity-client-enable'), { arguments: [this.entityName], name: this.entityName });
                if (!this.options.skipInstall) {
                    this.spawnCommandSync(this.clientPackageManager, ['run', 'codegen']);
                }
            }
        };
    }
};
