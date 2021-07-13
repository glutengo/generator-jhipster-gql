const chalk = require('chalk');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const packagejs = require('../../package.json');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const utils = require('../util');

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            readConfig() {
                this.jhipsterAppConfig = this.getJhipsterConfig();
                if (!this.jhipsterAppConfig) {
                    this.error('Cannot read .yo-rc.json');
                }
                this.clientPackageManager = this.jhipsterAppConfig.get(OptionNames.CLIENT_PACKAGE_MANAGER);
            },
            displayLogo() {
                // it's here to show that you can use functions from generator-jhipster
                // this function is in: generator-jhipster/generators/generator-base.js
                this.printJHipsterLogo();

                // Have Yeoman greet the user.
                this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster gql')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
            },
            checkJhipster() {
                const currentJhipsterVersion = this.jhipsterAppConfig.jhipsterVersion;
                const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
                if (!semver.satisfies(currentJhipsterVersion, minimumJhipsterVersion)) {
                    this.warning(
                        `\nYour generated project used an old JHipster version (${currentJhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`
                    );
                }
            }
        };
    }

    get composing() {
        const subGenerators = ['../client', '../server'];
        subGenerators.forEach(gen => this.composeWith(require.resolve(gen), {
           context: this.context,
           skipInstall: this.options.skipInstall,
           fromCli: true,
           force: this.options.force,
           debug: this.configOptions.isDebugEnabled
        }));
    }

    get prompting() {
        const done = this.async();
        const prompts = [];
        this.prompt(prompts).then(answers => {
            this.promptAnswers = answers;
            // To access props answers use this.promptAnswers.someOption;
            done();
        });
    }

    install() {
        const logMsg = `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;
        if (this.options['skip-install']) {
            this.log(logMsg);
        } else {
            this.spawnCommandSync(this.clientPackageManager, ['install']);
            if (utils.isNodeJSBlueprint(this)) {
                this.spawnCommandSync(this.clientPackageManager, ['install'], { cwd: `${process.cwd()}/server` });
                this.spawnCommandSync(this.clientPackageManager, ['run', 'build:schema-gql'], { cwd: `${process.cwd()}/server` });
            }
            this.spawnCommandSync(this.clientPackageManager, ['run', 'codegen']);
        }
    }
};
