const jHipsterConstants = require('generator-jhipster/generators/generator-constants');
const utils = require('./commons');

/**
 * Replaces the import paths for all files of the client application of the given generator
 * which use the standard reducer of an entity by those of the corresponding gql actions or vice versa.
 * The generator is expected to hold entity information such as the entityName and
 * to have a tsProject property holding the TypeScript project created via ts-morph.
 *
 * @param generator the Yeoman generator
 * @param disable whether to reverse the change: results in using the standard reducer instead of the gql actions
 */
function replaceImportPath(generator, disable = false) {
    const fileName = generator.entityName === 'user' ? 'user-management' : generator.entityName.toLowerCase();
    let oldFileName = `${fileName}.reducer`;
    let newFileName = `${fileName}.gql-actions`;
    if (disable) {
        const tmp = oldFileName;
        oldFileName = newFileName;
        newFileName = tmp;
    }
    // go through all source files and replace the import
    const sourceFiles = generator.tsProject.getSourceFiles('**/*.tsx');
    sourceFiles.forEach(file => {
        const oldImport = file.getImportDeclaration(declaration => declaration.getModuleSpecifierValue().includes(oldFileName));
        if (oldImport) {
            oldImport.setModuleSpecifier(oldImport.getModuleSpecifierValue().replace(oldFileName, newFileName));
            file.saveSync();
        }
    });
}

/**
 * Adjusts the user management component of the given generator. Adds the bypassCache parameter where needed to allow caching.
 * The generator is expected to have a tsProject property holding the TypeScript project created via ts-morph.
 *
 * @param generator the Yeoman generator
 * @param disable whether to reverse the change: results in using the standard reducer instead of the gql actions
 */
function adjustUserComponent(generator, disable = false) {
    const tsProject = generator.tsProject;
    const filePath = `${jHipsterConstants.REACT_DIR}/modules/administration/user-management/user-management.tsx`;
    const component = tsProject.getSourceFile(filePath);
    if (!component) return;
    const componentName = 'UserManagement';
    const functionName = 'getUsersFromProps';
    const parameterName = 'bypassCache';

    // get the required statements / expressions
    const reactComponentStatement = component.getVariableStatement(componentName);
    if (!reactComponentStatement) return;
    const reactComponent = reactComponentStatement.getDeclarations().find(d => d.getName() === componentName);
    if (!reactComponent) return;
    const getUsersFromProps = utils.getVariableAssignment(reactComponent.getInitializer(), functionName);
    if (!getUsersFromProps) return;
    const arrowFunction = getUsersFromProps.getInitializer();
    const handleSyncList = utils.getVariableAssignment(reactComponent.getInitializer(), 'handleSyncList');
    if (!handleSyncList) return;
    const getUsersFromPropsCall = utils.getFunctionCall(handleSyncList.getInitializer(), functionName);
    if (!getUsersFromPropsCall) return;
    const getUsersAsAdminCall = utils.getFunctionCall(getUsersFromProps.getInitializer(), 'getUsersAsAdmin');
    if (!getUsersAsAdminCall) return;

    if (disable) {
        // remove the bypassCache parameter from the geUsersFromProps method declaration
        const bypassCacheParameter = arrowFunction.getParameter(p => p.getName() === parameterName);
        if (!bypassCacheParameter) return;
        bypassCacheParameter.remove();

        // remove the bypassCache argument from the getUsersFromProps call inside handleSyncList
        if (getUsersFromPropsCall.getArguments().length !== 1) return;
        getUsersFromPropsCall.removeArgument(0);

        // remove the bypassCache argument from the getUsersAsAdminCall inside getUsersFromProps
        const getUsersAsAdminCallByPassCacheArgument = getUsersAsAdminCall
            .getArguments()
            .find(a => a.compilerNode.escapedText === parameterName);
        if (!getUsersAsAdminCallByPassCacheArgument) return;
        getUsersAsAdminCall.removeArgument(getUsersAsAdminCallByPassCacheArgument);
    } else {
        // add the bypassCache parameter to the geUsersFromProps method declaration
        arrowFunction.addParameter({ name: 'bypassCache', type: 'boolean', hasQuestionToken: true });

        // add the bypassCache argument to the getUsersFromProps call inside handleSyncList
        if (getUsersFromPropsCall.getArguments().length !== 0) return;
        getUsersFromPropsCall.addArgument('true');

        // add the bypassCache argument to the getUsersAsAdminCall inside getUsersFromProps
        getUsersAsAdminCall.addArgument('bypassCache');
    }
    component.saveSync();
}

/**
 * Adjusts the list component of the given generator. Adds the bypassCache parameter where needed to allow caching.
 * The generator is expected to hold entity information such as the entityName and
 * to have a tsProject property holding the TypeScript project created via ts-morph.
 *
 * @param generator the Yeoman generator
 * @param disable whether to reverse the change: results in using the standard reducer instead of the gql actions
 */
function adjustComponent(generator, disable = false) {
    if (generator.entityName === 'user') {
        adjustUserComponent(generator, disable);
        return;
    }
    const filePath = `${jHipsterConstants.REACT_DIR}/entities/${generator.entityFolderName}/${generator.entityFileName}.tsx`;
    const component = generator.tsProject.getSourceFile(filePath);
    if (!component) return;
    const componentName = utils.capitalize(generator.entityName);
    const functionName = 'getAllEntities';
    const sortFunctionName = 'sortEntities';
    const parameterName = 'bypassCache';

    // get the required statements / expressions
    const reactComponentStatement = component.getVariableStatement(componentName);
    if (!reactComponentStatement) return;
    const reactComponent = reactComponentStatement && reactComponentStatement.getDeclarations().find(d => d.getName() === componentName);
    if (!reactComponent) return;
    const getAllEntities = utils.getVariableAssignment(reactComponent.getInitializer(), functionName);
    if (!getAllEntities) return;
    const sortEntities = utils.getVariableAssignment(reactComponent.getInitializer(), sortFunctionName);
    if (!sortEntities) return;
    const getAllEntitiesCall = utils.getFunctionCall(sortEntities.getInitializer(), functionName);
    if (!getAllEntitiesCall) return;
    const handleSyncList = utils.getVariableAssignment(reactComponent.getInitializer(), 'handleSyncList');
    if (!handleSyncList) return;
    const sortAllEntitiesCall = utils.getFunctionCall(handleSyncList.getInitializer(), sortFunctionName);
    if (!sortAllEntitiesCall) return;
    const getEntitiesCall = utils.getFunctionCall(getAllEntities.getInitializer(), 'getEntities');
    if (!getEntitiesCall) return;

    if (disable) {
        // remove the bypassCache parameter from the getAllEntities method declaration
        const bypassCacheParameter = getAllEntities.getInitializer().getParameter(p => p.getName() === parameterName);
        if (!bypassCacheParameter) return;
        bypassCacheParameter.remove();

        // remove the bypassCache parameter from the sortEntities method declaration
        const sortEntitiesBypassCacheParameter = sortEntities.getInitializer().getParameter(p => p.getName() === parameterName);
        if (!sortEntitiesBypassCacheParameter) return;
        sortEntitiesBypassCacheParameter.remove();

        // remove the bypassCache argument from the getAllEntities call inside sortEntities
        const getAllEntitiesCallByPassCacheArgument = getAllEntitiesCall
            .getArguments()
            .find(a => a.compilerNode.escapedText === parameterName);
        if (!getAllEntitiesCallByPassCacheArgument) return;
        getAllEntitiesCall.removeArgument(getAllEntitiesCallByPassCacheArgument);

        // remove the bypassCache argument from the sortEntities call inside handleSyncList
        if (sortAllEntitiesCall.getArguments().length !== 1) return;
        sortAllEntitiesCall.removeArgument(0);

        // remove the bypassCache argument from the getEntities call inside getAllEntities
        const getEntitiesCallBypassCacheArgument = getEntitiesCall.getArguments().find(a => a.compilerNode.escapedText === parameterName);
        if (!getEntitiesCallBypassCacheArgument) return;
        getEntitiesCall.removeArgument(getEntitiesCallBypassCacheArgument);
    } else {
        // add the bypassCache parameter to the getAllEntities method declaration
        getAllEntities.getInitializer().addParameter({
            name: parameterName,
            type: 'boolean',
            hasQuestionToken: true
        });

        // add the bypassCache parameter to the sortEntities method declaration
        sortEntities.getInitializer().addParameter({
            name: parameterName,
            type: 'boolean',
            hasQuestionToken: true
        });

        // add the bypassCache argument to the getAllEntities call inside sortEntities
        getAllEntitiesCall.addArgument(parameterName);

        // add the bypassCache argument to the sortEntities call inside handleSyncList
        if (sortAllEntitiesCall.getArguments().length !== 0) return;
        sortAllEntitiesCall.addArgument('true');

        // add the bypassCache argument to the getEntities call inside getAllEntities
        getEntitiesCall.addArgument(parameterName);
    }
    component.saveSync();
}

module.exports = {
    replaceImportPath,
    adjustComponent
};
