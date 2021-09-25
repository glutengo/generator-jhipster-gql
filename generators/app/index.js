const chalk = require('chalk');
const semver = require('semver');
const BaseGenerator = require('generator-jhipster/generators/generator-base');
const { OptionNames } = require('generator-jhipster/jdl/jhipster/application-options');
const { prepareEntityForTemplates, prepareEntityPrimaryKeyForTemplates } = require('generator-jhipster/utils/entity');
const { prepareRelationshipForTemplates } = require('generator-jhipster/utils/relationship');
const { prepareFieldForTemplates } = require('generator-jhipster/utils/field');
const utils = require('../../utils/commons');
const packagejs = require('../../package.json');
const { askForEndpoint, askForSchemaLocation } = require('../../utils/prompts');
const constants = require('../../utils/constants');

/**
 * App generator
 */
module.exports = class extends BaseGenerator {
    /**
     * Initializes the generator by reading the configuration
     */
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
                this.printJHipsterLogo();

                // Have Yeoman greet the user.
                this.log(`\nWelcome to the ${chalk.bold.yellow('JHipster gql')} generator! ${chalk.yellow(`v${packagejs.version}\n`)}`);
            },
            checkJhipster() {
                const currentJhipsterVersion = this.jhipsterAppConfig.get(OptionNames.JHIPSTER_VERSION);
                const minimumJhipsterVersion = packagejs.dependencies['generator-jhipster'];
                if (!currentJhipsterVersion) {
                    this.error('\nYour project does not use JHipster. jhipster-gql can only be used in JHipster projects.\n');
                }
                if (!semver.satisfies(currentJhipsterVersion, minimumJhipsterVersion)) {
                    this.warning(
                        `\nYour generated project used an old JHipster version (${currentJhipsterVersion})... you need at least (${minimumJhipsterVersion})\n`
                    );
                }
            },
            checkNodeJSBlueprint() {
                if (!utils.isNodeJSBlueprint(this)) {
                    this.warning(
                        '\nYour generated project does not use the Node.js Blueprint. generator-jhipster-gql will only be able to generate client code.\n'
                    );
                }
            }
        };
    }

    /**
     * Prompts for the GraphQL endpoint and schema location
     */
    get prompting() {
        return {
            askForEndpoint() {
                return askForEndpoint.call(this);
            },
            askForSchemaLocation() {
                return askForSchemaLocation.call(this);
            },
            saveConfig() {
                utils.saveConfig(this);
            }
        };
    }

    /**
     * Composes the generator. The server and client sub-generators are called
     */
    get composing() {
        return {
            composing() {
                const subGenerators = ['../server', '../client'];
                const context = { ...this.context };
                // forward the config obtained in the prompts
                utils.copyConfig(this, context, [constants.CONFIG_KEY_ENDPOINT, constants.CONFIG_KEY_SCHEMA_LOCATION]);
                subGenerators.forEach(gen =>
                    this.composeWith(require.resolve(gen), {
                        context,
                        skipInstall: this.options.skipInstall,
                        fromCli: true,
                        force: this.options.force,
                        debug: this.configOptions.isDebugEnabled
                    })
                );
            }
        };
    }

    /**
     * Registers the entity sub generator as a post entity creation hook
     */
    get writing() {
        return {
            writing() {
                try {
                    this.registerModule('generator-jhipster-gql', 'entity', 'post', 'entity', 'GraphQL integration for JHipster');
                } catch (err) {
                    this.log(`${chalk.red.bold('WARN!')} Could not register as a jhipster entity post creation hook...\n`);
                }
            }
        };
    }

    /**
     * Installs the NPM dependencies, builds the GraphQL schema and the client typing information
     */
    get install() {
        return {
            install() {
                const logMsg = `To install your dependencies manually, run: ${chalk.yellow.bold(`${this.clientPackageManager} install`)}`;
                if (this.options.skipInstall) {
                    this.log(logMsg);
                } else {
                    this.spawnCommandSync(this.clientPackageManager, ['install']);
                    if (utils.isNodeJSBlueprint(this)) {
                        this.spawnCommandSync(this.clientPackageManager, ['install'], { cwd: `${process.cwd()}/server` });
                    }
                }
            }
        };
    }

    /**
     * Runs the entity sub-generator for all entities known to the application
     */
    get end() {
        return {
            runEntities() {
                const entities = this.getJhipsterConfig().get('entities');
                if (entities) {
                    // first: prepare all entities with their fields. Add all entities to shared entities
                    entities.forEach(e => {
                        const entityConfig = this.getEntityConfig(e).getAll();
                        entityConfig[OptionNames.PROD_DATABASE_TYPE] = this.config.get(OptionNames.PROD_DATABASE_TYPE);

                        prepareEntityForTemplates(entityConfig, this);
                        prepareEntityPrimaryKeyForTemplates(entityConfig, this);
                        entityConfig.fields.forEach(f => prepareFieldForTemplates(entityConfig, f, this));
                        this.configOptions.sharedEntities[e] = entityConfig;
                    });

                    // after that: loop over entities, prepare the relationships (using shared entities)
                    // and run the entity generator for each entity
                    entities.forEach(e => {
                        const entityConfig = this.configOptions.sharedEntities[e];
                        entityConfig.relationships.forEach(r => {
                            const otherEntityName = this._.upperFirst(r.otherEntityName);
                            const otherEntity = this.configOptions.sharedEntities[otherEntityName];
                            r.otherEntity = otherEntity;
                            prepareRelationshipForTemplates(entityConfig, r, this);
                        });
                        this.composeWith(require.resolve('../entity'), {
                            context: { ...this.context },
                            entityConfig,
                            skipInstall: this.options.skipInstall,
                            fromCli: true,
                            force: this.options.force,
                            debug: this.configOptions.isDebugEnabled
                        });
                    });
                }
            },
            generateSchema() {
                if (!this.options.skipInstall) {
                    if (utils.isNodeJSBlueprint(this)) {
                        this.spawnCommandSync(this.clientPackageManager, ['run', 'build:schema-gql'], { cwd: `${process.cwd()}/server` });
                    }
                    this.spawnCommandSync(this.clientPackageManager, ['run', 'codegen']);
                }
            }
        };
    }
};
