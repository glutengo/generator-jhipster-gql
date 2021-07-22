const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { writeFiles } = require('./files');
const utils = require('../../utils/commons');

module.exports = class extends BaseGenerator {
    get writing() {
        if (utils.isNodeJSBlueprint(this)) {
            return writeFiles();
        } else {
            // TODO: warning about missing Node.js blueprint
        }
    }
}
