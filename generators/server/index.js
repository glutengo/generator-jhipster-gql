const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { writeFiles } = require('./files');
const utils = require('../../utils/commons');
const { askForEndpoint, askForSchemaLocation } = require('../../utils/prompts');
const constants = require('../../utils/constants');


module.exports = class extends BaseGenerator {

    get initializing() {
        utils.loadConfig(this);
        utils.loadConfig(this, this.options.context);
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
            saveConfig() {
                utils.saveConfig(this);
            }
        };
    }

    get writing() {
        if (utils.isNodeJSBlueprint(this)) {
            return writeFiles();
        } else {
            // TODO: warning about missing Node.js blueprint
        }
    }
}
