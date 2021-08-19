const { replaceImportPath } = require('../../utils/react');

function adjustReactFiles(generator) {
    replaceImportPath(generator, true);
}

module.exports = {
    adjustReactFiles
};
