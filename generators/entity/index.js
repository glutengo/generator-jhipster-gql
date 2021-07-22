const chalk = require('chalk');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const jhipsterConstants = require('generator-jhipster/generators/generator-constants');
const packagejs = require('../../package.json');
const constants = require('../../utils/constants');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');

module.exports = class extends BaseGenerator {
    get initializing() {
        return {
            readConfig() {
                this.entityConfig = this.options.entityConfig;
                this.jhipsterAppConfig = this.getJhipsterConfig();
                if (!this.jhipsterAppConfig) {
                    this.error('Cannot read .yo-rc.json');
                }
                this.gqlConfig = this.config.get(constants.CONFIG_KEY);
                this.databaseType = this.config.get(OptionNames.DATABASE_TYPE);
                this.clientFramework = this.config.get(OptionNames.CLIENT_FRAMEWORK);
            },
            displayLogo() {
                this.log(chalk.white(`Running ${chalk.bold('JHipster GraphQL')} Generator! ${chalk.yellow(`v${packagejs.version}\n`)}`));
            },
            validate() {
                // this shouldn't be run directly
                if (!this.entityConfig) {
                    this.env.error(
                        `${chalk.red.bold('ERROR!')} This sub generator should be used only from JHipster and cannot be run directly...\n`
                    );
                }
            }
        };
    }

    composing() {
        const subGenerators = ['../entity-client', '../entity-server'];
        subGenerators.forEach(gen => this.composeWith(require.resolve(gen), {
           context: this.context,
           entityConfig: this.options.entityConfig,
           skipInstall: this.options.skipInstall,
           fromCli: true,
           force: this.options.force,
           entityConfig: this.entityConfig,
           debug: this.configOptions.isDebugEnabled,
           gqlConfig: this.gqlConfig,
           databaseType: this.databaseType,
           clientFramework: this.clientFramework
        }));
    }

    get writing() {
        return {
            updateFiles() {
                // read config from .yo-rc.json
                this.baseName = this.jhipsterAppConfig.baseName;
                this.packageName = this.jhipsterAppConfig.packageName;
                this.packageFolder = this.jhipsterAppConfig.packageFolder;
                this.clientPackageManager = this.jhipsterAppConfig.clientPackageManager;
                this.buildTool = this.jhipsterAppConfig.buildTool;

                // use function in generator-base.js from generator-jhipster
                this.angularAppName = this.getFrontendAppName();

                // use constants from generator-constants.js
                const javaDir = `${jhipsterConstants.SERVER_MAIN_SRC_DIR + this.packageFolder}/`;
                const resourceDir = jhipsterConstants.SERVER_MAIN_RES_DIR;
                const webappDir = jhipsterConstants.CLIENT_MAIN_SRC_DIR;

                const entityName = this.entityConfig.entityClass;

                // show all variables
                this.log('\n--- some const ---');
                this.log(`javaDir=${javaDir}`);
                this.log(`resourceDir=${resourceDir}`);
                this.log(`webappDir=${webappDir}`);

                this.log('\n--- entityName ---');
                this.log(`entityName=${entityName}`);

                this.log('------\n');
            },

            writeFiles() {
                //this.template('dummy.txt', 'dummy.txt');
            },

            updateConfig() {
                // TODO: store GQL settings for entity
            }
        };
    }
};
