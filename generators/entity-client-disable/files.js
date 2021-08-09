const { isAngular, isReact, isVue } = require('../../utils/commons');
const { adjustAngularFiles } = require('./files-angular');
const { adjustReactFiles } = require('./files-react');
const { adjustVueFiles } = require('./files-vue');

module.exports = {
    writeFiles
};

function writeFiles() {
    return {
        adjustFiles() {
            if (isAngular(this)) {
                adjustAngularFiles(this);
            }
            if (isReact(this)) {
                adjustReactFiles(this);
            }
            if (isVue(this)) {
                adjustVueFiles(this);
            }
        }
    };
}
