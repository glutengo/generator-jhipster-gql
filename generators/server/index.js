const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const { writeFiles } = require('./files');
const utils = require('../../utils/commons');
const { askForEndpoint, askForSchemaLocation } = require('../../utils/prompts');
const constants = require('../../utils/constants');

module.exports = class extends BaseGenerator {
    initializing() {
        utils.loadConfig(this);
        utils.loadConfig(this, this.options.context);
        this.databaseType = this.config.get(OptionNames.DATABASE_TYPE);

        if (!utils.isNodeJSBlueprint(this)) {
            this.warning(
                '\nYour generated project does not use the Node.js Blueprint. generator-jhipster-gql will only be able to generate client code.\n'
            );
        }
    }

    get prompting() {
        if (utils.isNodeJSBlueprint(this)) {
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
        return {};
    }

    get writing() {
        if (utils.isNodeJSBlueprint(this)) {
            return writeFiles();
        }
        this.warning(
            '\nYour generated project does not use the Node.js Blueprint. generator-jhipster-gql will only be able to generate client code.\n'
        );
        return {};
    }
};
