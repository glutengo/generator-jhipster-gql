const chalk = require('chalk');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
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
        ['../entity-server', '../entity-client'].forEach(gen => this.composeWith(require.resolve(gen), {
           context: this.context,
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
};
