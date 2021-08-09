const { removeServiceProvider } = require('../../utils/angular');

function adjustAngularFiles(generator) {
    removeServiceProvider(generator);
}

module.exports = {
    adjustAngularFiles
};
