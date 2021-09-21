const assert = require('yeoman-assert');
const path = require('path');

function assertConfigurationFiles() {
    assert.file(['codegen.yml']);
}

function assertServerFiles() {
    assert.file([
        path.join('server', 'src', 'module', 'graphql.module.ts'),
        path.join('server', 'src', 'service', 'graphql', 'paginated.object-type.ts'),
        path.join('server', 'src', 'service', 'graphql', 'pub-sub.service.ts'),
        path.join('server', 'src', 'service', 'graphql', 'user.input-type.ts'),
        path.join('server', 'src', 'service', 'graphql', 'user.object-type.ts'),
        path.join('server', 'src', 'web', 'graphql', 'pagination-util.ts'),
        path.join('server', 'src', 'web', 'graphql', 'field-resolver-util.ts'),
        path.join('server', 'src', 'web', 'graphql', 'user.resolver.ts')
    ]);
}

function assertServerEntityFiles(entity) {
    assert.file([
        path.join('server', 'src', 'service', 'graphql', `${entity}.input-type.ts`),
        path.join('server', 'src', 'service', 'graphql', `${entity}.object-type.ts`),
        path.join('server', 'src', 'web', 'graphql', `${entity}.resolver.ts`)
    ]);
}

function assertCommonClientFiles() {
    assert.file([
        path.join('src', 'main', 'webapp', 'app', 'entities', 'user', 'user.graphql')
    ]);
}

function assertCommonClientEntityFiles(entity) {
    assert.file([
        path.join('src', 'main', 'webapp', 'app', 'entities', entity, `${entity}.graphql`)
    ]);
}


module.exports = {
    assertServerFiles,
    assertServerEntityFiles,
    assertConfigurationFiles,
    assertCommonClientFiles,
    assertCommonClientEntityFiles
}
