const { replaceServiceProvider } = require('../../utils/vue');
const utils = require('../../utils/commons');

function adjustVueFiles(generator) {
    replaceServiceProvider(utils.getTsProject(generator), generator.entityName);
}

module.exports = {
    adjustVueFiles
};
