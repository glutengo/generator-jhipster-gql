const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { writeFiles } = require('./files');
const { askForTypeDefinition, askForEndpoint, askForSchemaLocation } = require('../../utils/prompts');
const { OptionNames } =  require('generator-jhipster/jdl/jhipster/application-options'); // require('../jdl/jhipster/application-options');
const { saveConfig, loadConfig } = require('../../utils/commons');
const constants = require('../../utils/constants');

module.exports = class extends BaseGenerator {

    get initializing() {
        this.clientFramework = this.config.get(OptionNames.CLIENT_FRAMEWORK);
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
        }
    }

    get writing() {
        return writeFiles();
    }
}
