const EntityClientBaseGenerator = require('../../utils/entity-client-base.generator');
const { writeFiles } = require('./files');

/**
 * Entity Client Disable Generator
 */
module.exports = class extends EntityClientBaseGenerator {
    /**
     * Initializes the generator by reading the configuration
     */
    initializing() {
        super.initializing();
    }

    /**
     * Writes the entity-client-enable files
     */
    get writing() {
        return {
            ...writeFiles()
        };
    }
};
