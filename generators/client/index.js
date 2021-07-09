const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { writeFiles } = require('./files');
const { askForTypeDefinition, askForEndpoint, askForSchemaLocation } = require('./prompts');

module.exports = class extends BaseGenerator {

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
