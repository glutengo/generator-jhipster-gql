const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options'); // require('../jdl/jhipster/application-options');
const { writeFiles } = require('./files');
const { askForTypeDefinition, askForEndpoint, askForSchemaLocation } = require('../../utils/prompts');
const { saveConfig, loadConfig } = require('../../utils/commons');
const constants = require('../../utils/constants');

module.exports = class extends BaseGenerator {
    get initializing() {
        this.clientFramework = this.config.get(OptionNames.CLIENT_FRAMEWORK);
        this.databaseType = this.config.get(OptionNames.DATABASE_TYPE);
        loadConfig(this);
        loadConfig(this, this.options.context);
    }

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

    get writing() {
        return writeFiles();
    }

    end() {
        this.composeWith(require.resolve('../entity-client-enable'), { arguments: ['user'], name: 'user' });
    }
};
