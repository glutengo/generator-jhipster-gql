const { replaceImportPath, adjustComponent } = require('../../utils/react');
const utils = require('../../utils/commons');

function adjustReactFiles(generator) {
    generator.tsProject = utils.getTsProject(generator);
    replaceImportPath(generator, true);
    adjustComponent(generator, true);
}

module.exports = {
    adjustReactFiles
};
