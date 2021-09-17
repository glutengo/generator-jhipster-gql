const constants = require('./constants');

/**
 * Prompting function for the GraphQL Type Definition
 *
 * @returns {Promise<void>}
 */
async function askForTypeDefinition() {
    const prompts = [
        {
            type: 'list',
            name: 'typeDefinition',
            message: 'Where do you want to specfiy your GraphQL operations?',
            choices: [
                {
                    value: constants.TYPE_DEFINITION_GRAPHQL,
                    name: 'GraphQL documents'
                },
                {
                    value: constants.TYPE_DEFINITION_TYPESCRIPT,
                    name: 'TypeScript classes'
                }
            ]
        }
    ];
    const props = await this.prompt(prompts);
    this.typeDefinition = props.typeDefinition;
}

/**
 * Prompting function for the GraphQL endpoint
 *
 * @returns {Promise<void>}
 */
async function askForEndpoint() {
    const prompts = [
        {
            type: 'input',
            name: 'endpoint',
            message: 'Which is the endpoint of your GraphQL API?',
            default: '/graphql'
        }
    ];
    const props = await this.prompt(prompts);
    this.endpoint = props.endpoint;
}

/**
 * Prompting function for the GraphQL Schema Location
 *
 * @returns {Promise<void>}
 */
async function askForSchemaLocation() {
    const prompts = [
        {
            type: 'input',
            name: 'schemaLocation',
            message: 'Where is your GraphQL schema located',
            default: 'server/schema.gql'
        }
    ];
    const props = await this.prompt(prompts);
    this.schemaLocation = props.schemaLocation;
}

module.exports = {
    askForTypeDefinition,
    askForEndpoint,
    askForSchemaLocation
};
