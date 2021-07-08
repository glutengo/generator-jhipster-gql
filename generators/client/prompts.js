const constants = require('../generator-gql-constants');

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
    ]
    const props = await this.prompt(prompts);
    this.typeDefinition = props.typeDefinition;
    if (this.typeDefinition === constants.TYPE_DEFINITION_TYPESCRIPT) {
        const secondLevelPrompts = [
            {
                type: 'confirm',
                name: 'experimentalTransformer',
                message: `Do you want to use the EXPRIMENTAL transformer? This allows for a cleaner syntax when specifying the types but results in an altered build process which may break if the client framework is updated.`,
                default: false,
          },
        ]
        const secondLevelProps = await this.prompt(secondLevelPrompts);
        this.experimentalTransformer = secondLevelProps.experimentalTransformer;
    }
}

module.exports = {
    askForTypeDefinition,
    constants
}
