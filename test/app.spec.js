const path = require('path');
const fse = require('fs-extra');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('JHipster generator gql', function() {
    describe('Test with Node and AngularX', function() {
        this.timeout(30000);
        beforeEach(done => {
            helpers
                .run(path.join(__dirname, '../generators/app'))
                .inTmpDir(dir => fse.copySync(path.join(__dirname, '../test/templates/node-angular'), dir))
                .withOptions({
                    skipInstall: true
                })
                .withPrompts({
                    typeDefinition: 'GraphQL'
                })
                .on('end', done);
        });

        it('generates the configuration files', () => {
            assert.file(['codegen.yml']);
        });

        it('generates the GraphQL server files', () => {
            assert.file([path.join('server', 'src', 'module', 'graphql.module.ts')]);
        });

        it('generates the GraphQL client files', () => {
            assert.file([
                path.join('src', 'main', 'webapp', 'app', 'graphql', 'graphql.module.ts'),
                path.join('src', 'main', 'webapp', 'app', 'graphql', 'graphql.providers.ts'),
                path.join('src', 'main', 'webapp', 'app', 'graphql', 'graphql.cache.service.ts'),
                path.join('src', 'main', 'webapp', 'app', 'core', 'util', 'graphql-util.service.ts'),
                path.join('src', 'main', 'webapp', 'app', 'core', 'util', 'graphql-cache-watcher.ts'),
                path.join('src', 'main', 'webapp', 'app', 'core', 'util', 'pub-sub.ts'),
                path.join('src', 'main', 'webapp', 'app', 'entities', 'user', 'user.gql.service.ts'),
                path.join('src', 'main', 'webapp', 'app', 'entities', 'user', 'user.graphql')
            ]);
        });
    });
});
