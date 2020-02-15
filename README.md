# Ink

Server side codes for KamiNote

# Stack

- Language - [Typescript](https://www.typescriptlang.org/)
- Framework - [graphql-yoga](https://github.com/prisma-labs/graphql-yoga)
- Database - [PostgreSQL](https://www.postgresql.org/)
- Authentication - [OAuth](https://oauth.net/)

# Getting started

The following will set you up for development.

## Installation

First, install dependencies

```
yarn
```

## Start development

This will also launch GraphQL playground in [http://localhost:4000/](http://localhost:4000/)

```
yarn dev
```

## GraphQL typings

GraphQL typing should not be done manually, instead be generated using [gql2ts](https://github.com/amount/gql2ts)

```
yarn genGraphql
```

# Database

We use [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/). See `src/entity` folder for more.

# Authentication

We use [OAuth](https://oauth.net/) + [JWT](https://jwt.io/) for authentication with the client. Currently, only Google strategy is set up. see `src/authentication` for more.

# Deployment

Master branch is automatically deployed to [Heroku](https://www.heroku.com/home) with the database done using [Heroku PostgreSQL add-ons](https://elements.heroku.com/addons/heroku-postgresql).
