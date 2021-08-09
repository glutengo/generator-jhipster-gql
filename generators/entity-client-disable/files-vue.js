const { replaceServiceProvider } = require('../../utils/vue');
const utils = require('../../utils/commons');

function adjustVueFiles(generator) {
    const tsProject = utils.getTsProject(generator);
    replaceServiceProvider(tsProject, generator.entityName, true);
}

module.exports = {
    adjustVueFiles
};
