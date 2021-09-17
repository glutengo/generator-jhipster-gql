const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { writeFiles } = require('./files');
const utils = require('../../utils/commons');
const { prepareEntitySubGenerator } = require('../../utils/entity');

module.exports = class extends BaseGenerator {
    initializing() {
        prepareEntitySubGenerator(this);
        this.gqlFields = this.options.entityConfig.gqlFields;
    }

    get writing() {
        if (utils.isNodeJSBlueprint(this)) {
            return {
                ...writeFiles()
            };
        }
        return {};
    }

    end() {
        if (!this.options.skipInstall) {
            if (utils.isNodeJSBlueprint(this)) {
                this.spawnCommandSync(this.clientPackageManager, ['run', 'build:schema-gql'], { cwd: `${process.cwd()}/server` });
            }
        }
    }
};
