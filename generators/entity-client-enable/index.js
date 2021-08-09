const EntityClientBaseGenerator = require('../../utils/entity-client-base.generator');
const { writeFiles } = require('./files');

module.exports = class extends EntityClientBaseGenerator {

    initializing() {
        super.initializing();
    }

    get writing() {
        return {
            ...writeFiles()
        };
    }
};
