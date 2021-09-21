const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { writeFiles } = require('./files');
const utils = require('../../utils/commons');
const { prepareEntitySubGenerator } = require('../../utils/entity');

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            prepare() {
                prepareEntitySubGenerator(this);
                this.gqlFields = this.options.entityConfig.gqlFields;
            }
        };
    }

    get writing() {
        if (utils.isNodeJSBlueprint(this)) {
            return {
                ...writeFiles()
            };
        }
        return {};
    }

    get end() {
        if (!this.options.skipInstall && utils.isNodeJSBlueprint(this)) {
            return {
                end() {
                    this.spawnCommandSync(this.clientPackageManager, ['run', 'build:schema-gql'], {
                        cwd: `${process.cwd()}/server`
                    });
                }
            };
        }
        return {};
    }
};
