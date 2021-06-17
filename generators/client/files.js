const clientFiles = {
    graphQL: [
        {
            condition: generator => generator.clientFramework === 'angularX',
            templates: [
                {
                    file: 'angular/graphql/graphql.module.ts',
                    renameTo: () => `${ANGULAR_DIR}/graphql/graphql.module.ts`
                },
                {
                    file: 'angular/core/util/graphql-util.service.ts',
                    renameTo: () => `${ANGULAR_DIR}/core/util/graphql-util.service.ts`
                },
                {
                    file: 'angular/webpack/proxy.conf.js',
                    renameTo: () => 'webpack/proxy.conf.js'
                },
                {
                    file: 'angular/entities/user/user.graphql',
                    renameTo: () => `${ANGULAR_DIR}/entities/user/user.graphql`
                },
                {
                    file: 'angular/entities/user/user.gql.service.ts',
                    renameTo: () => `${ANGULAR_DIR}/entities/user/user.gql.service.ts`
                },
                {
                    file: 'angular/codegen.yml',
                    renameTo: () => 'codegen.yml'
                }
            ]
        }
    ]
};

function adjustProxyConf() {
    // TODO: parse proxy.conf.js
}

function writeFiles() {
    return {
        writeGraphQLFiles() {
            this.clientFramework = this.getJhipsterConfig().clientFramework;
            this.writeFilesToDisk(clientFiles, this, false);
        }
    }
}

module.exports = {
    writeFiles
};
