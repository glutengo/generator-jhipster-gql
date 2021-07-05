const chalk = require('chalk');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const packagejs = require('../../package.json');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');


module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            init(args) {
                if (args === 'default') {
                    // do something when argument is 'default'
                    this.message = 'default message';
                }
            },
            readConfig() {
                this.jhipsterAppConfig = this.getJhipsterConfig();
                if (!this.jhipsterAppConfig) {
                    this.error('Cannot read .yo-rc.json');
                }
                this.clientFramework = this.jhipsterAppConfig.get(OptionNames.CLIENT_FRAMEWORK);
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

    composing() {
        const subGenerators = ['../client', '../server'];
        subGenerators.forEach(gen => this.composeWith(require.resolve(gen), {
           context: this.context,
           skipInstall: this.options.skipInstall,
           fromCli: true,
           force: this.options.force,
           debug: this.configOptions.isDebugEnabled
        }));
    }

    prompting() {
        const done = this.async();
        const prompts = [];
        this.prompt(prompts).then(answers => {
            this.promptAnswers = answers;
            // To access props answers use this.promptAnswers.someOption;
            done();
        });
    }

    writing() {



        // use constants from generator-constants.js
        const javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
        const resourceDir = jhipsterConstants.SERVER_MAIN_RES_DIR;
        const webappDir = jhipsterConstants.CLIENT_MAIN_SRC_DIR;

        // variable from questions
        if (typeof this.message === 'undefined') {
            this.message = this.promptAnswers.message;
        }

        // show all variables
        this.log('\n--- some config read from config ---');
        this.log(`clientPackageManager=${this.clientPackageManager}`);

        try {
            this.registerModule('generator-jhipster-gql', 'entity', 'post', 'entity', 'GraphQL integration for JHipster');
        } catch (err) {
            this.log(`${chalk.red.bold('WARN!')} Could not register as a jhipster entity post creation hook...\n`);
        }
    }

    install() {
        const logMsg = `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;
        const isNodeJSBlueprint = !! this.jhipsterAppConfig.get('blueprints').find(b => b.name === 'generator-jhipster-nodejs');
        if (this.options['skip-install']) {
            this.log(logMsg);
        } else {
            this.spawnCommandSync(this.clientPackageManager, ['install']);
            if (isNodeJSBlueprint) {
                this.spawnCommandSync(this.clientPackageManager, ['install'], { cwd: `${process.cwd()}/server` });
            }
        }
    }

    end() {
        this.log('End of gql generator');
    }
};
