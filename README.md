# generator-jhipster-gql

[![npm version](https://badge.fury.io/js/generator-jhipster-gql.svg)](https://www.npmjs.com/package/generator-jhipster-gql) 
[![pipeline status](https://github.com/glutengo/generator-jhipster-gql/actions/workflows/github-ci.yml/badge.svg)](https://github.com/glutengo/generator-jhipster-gql/actions)

> JHipster module, GraphQL integration for JHipster

# Introduction

This is a [JHipster](https://www.jhipster.tech/) module, that is meant to be used in a JHipster application. 
The module adds support for GraphQL to existing JHipster web applications which were built with the [Node.js Blueprint](https://github.com/jhipster/generator-jhipster-nodejs).
When run, this generator installs [@nestjs/graphql](https://github.com/nestjs/graphql) for the server application and scaffolds resolvers for the user entity and all other entities present in the application.
For the client application, [@apollo/client](https://github.com/apollographql/apollo-client) is installed and all REST calls related to entities are replaced by corresponding GraphQL requests.
Angular, React and Vue are supported.

# Prerequisites

As this is a [JHipster](https://www.jhipster.tech/) module, JHipster must already be installed. 
It is also highly recommended that the application is initially built with the Node.js Blueprint.

- [Installing JHipster](https://www.jhipster.tech/installation/)
- [Node.js Blueprint](https://github.com/jhipster/generator-jhipster-nodejs)

# Installation

## With NPM

To install this module:

```bash
npm install -g generator-jhipster-gql
```

To update this module:

```bash
npm update -g generator-jhipster-gql
```

# Usage

## Run the module
```yo jhipster-gql```

### Options
#### GraphQL schema location
This option controls which schema is used for building the GraphQL typing information in the client application.

#### GraphQL endpoint
This option controls which GraphQL endpoint is called from the client application

#### GraphQL type definition
This options controls where the GraphQL types and selection sets are defined. 
In the default setup (`GraphQL`) this is achieved via GraphQL documents with the help of [GraphQL Code Generator Typescript Operations](https://www.graphql-code-generator.com/docs/plugins/typescript-operations).
Alternatively, it is possible to store the definitions in TypeScript classes using [graphql-typeop](https://github.com/glutengo/graphql-typeop) with the `TypeScript` option.

## Enable GraphQL for a specific entity in the client application
```yo jhipster-gql:entity-client-enable <ENTITY_NAME>```

## Disable GraphQL for a specific entity in the client application
```yo jhipster-gql:entity-client-disable <ENTITY_NAME>```

# License

Apache-2.0 © [Markus Glutting](https://glutting.net)

[npm-image]: https://img.shields.io/npm/v/generator-jhipster-gql.svg
[npm-url]: https://npmjs.org/package/generator-jhipster-gql
[github-actions-image]: https://github.com/glutengo/generator-jhipster-gql/workflows/Build/badge.svg
[github-actions-url]: https://github.com/glutengo/generator-jhipster-gql/actions
[daviddm-image]: https://david-dm.org/glutengo/generator-jhipster-gql.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/glutengo/generator-jhipster-gql
