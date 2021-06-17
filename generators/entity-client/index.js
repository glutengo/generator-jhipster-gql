const BaseGenerator = require('generator-jhipster/generators/generator-base');

module.exports = class extends BaseGenerator {
    postWriting() {
        console.log('POST WRITING ENTITY CLIENT');
    }
}
