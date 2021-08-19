const { replaceImportPath } = require('../../utils/react');

function adjustReactFiles(generator) {
    replaceImportPath(generator);
}

module.exports = {
    adjustReactFiles
};
