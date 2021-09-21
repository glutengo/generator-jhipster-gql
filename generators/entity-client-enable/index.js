const EntityClientBaseGenerator = require('../../utils/entity-client-base.generator');
const { writeFiles } = require('./files');

/**
 * Entity Client Enable Generator
 */
module.exports = class extends EntityClientBaseGenerator {
    /**
     * Initializes the generator by reading the configuration
     */
    get initializing() {
        return {
            ...super.initializing
        };
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
