const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { writeFiles } = require('./files');
const { askForTypeDefinition, askForEndpoint, askForSchemaLocation } = require('../../utils/prompts');
const { OptionNames } =  require('generator-jhipster/jdl/jhipster/application-options') // require('../jdl/jhipster/application-options');

module.exports = class extends BaseGenerator {

    get initializing() {
        this.clientFramework = this.config.get(OptionNames.CLIENT_FRAMEWORK);
    }

    get prompting() {
        return {
            askForTypeDefinition,
            askForEndpoint,
            askForSchemaLocation,
            saveConfig() {
                this.config.set('gql', {
                    typeDefinition: this.typeDefinition,
                    experimentalTransformer: this.experimentalTransformer,
                    endpoint: this.endpoint,
                    schemaLocation: this.schemaLocation
                });
            }
        }
    }

    get writing() {
        return writeFiles();
    }
}
