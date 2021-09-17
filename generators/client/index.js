const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const { writeFiles } = require('./files');
const { askForTypeDefinition, askForEndpoint, askForSchemaLocation } = require('../../utils/prompts');
const { saveConfig, loadConfig } = require('../../utils/commons');
const constants = require('../../utils/constants');

/**
 * Client generator
 */
module.exports = class extends BaseGenerator {
    /**
     * Initializes the generator by reading the configuration
     */
    initializing() {
        this.clientFramework = this.config.get(OptionNames.CLIENT_FRAMEWORK);
        this.databaseType = this.config.get(OptionNames.DATABASE_TYPE);
        loadConfig(this);
        loadConfig(this, this.options.context);
    }

    /**
     * Prompts for the GraphQL endpoint and schema location (if not previously provided) and for the type definition
     */
    get prompting() {
        return {
            askForEndpoint() {
                if (!this[constants.CONFIG_KEY_ENDPOINT]) {
                    askForEndpoint.call(this);
                }
            },
            askForSchemaLocation() {
                if (!this[constants.CONFIG_KEY_SCHEMA_LOCATION]) {
                    askForSchemaLocation.call(this);
                }
            },
            askForTypeDefinition,
            saveConfig() {
                saveConfig(this);
            }
        };
    }

    /**
     * Writes the client files
     */
    get writing() {
        return writeFiles();
    }

    /**
     * Runs the entity-client-enable generator for the user entity
     */
    end() {
        this.composeWith(require.resolve('../entity-client-enable'), { arguments: ['user'], name: 'user' });
    }
};
