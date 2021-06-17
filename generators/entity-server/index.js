const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { writeFiles } = require('./files');

module.exports = class extends BaseGenerator {
    postWriting() {
        console.log('POST WRITING ENTITY SERVER');
    }

    writing() {
        return writeFiles();
    }
}
