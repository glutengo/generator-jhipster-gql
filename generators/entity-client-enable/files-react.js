const { replaceImportPath, adjustComponent } = require('../../utils/react');
const utils = require('../../utils/commons');

function adjustReactFiles(generator) {
    generator.tsProject = utils.getTsProject(generator);
    replaceImportPath(generator);
    adjustComponent(generator);
}

module.exports = {
    adjustReactFiles
};
