const TYPE_DEFINITION_GRAPHQL = 'GraphQL';
const TYPE_DEFINITION_TYPESCRIPT = 'TypeScript';

const constants = { TYPE_DEFINITION_GRAPHQL, TYPE_DEFINITION_TYPESCRIPT };

async function askForTypeDefinition() {
    const prompts = [
        {
            type: 'list',
            name: 'typeDefinition',
            message: 'Where do you want to specfiy your GraphQL operations?',
            choices: [
                {
                    value: TYPE_DEFINITION_GRAPHQL,
                    name: 'GraphQL documents'
                },
                {
                    value: TYPE_DEFINITION_TYPESCRIPT,
                    name: 'TypeScript classes'
                }
            ]
        }
    ]
    const props = await this.prompt(prompts);
    this.typeDefinition = props.typeDefinition;
    if (this.typeDefinition === TYPE_DEFINITION_TYPESCRIPT) {
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
