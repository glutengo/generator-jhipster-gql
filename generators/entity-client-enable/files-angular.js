const { addServiceProvider } = require('../../utils/angular');

function adjustAngularFiles(generator) {
    addServiceProvider(generator);
}

module.exports = {
    adjustAngularFiles
};
