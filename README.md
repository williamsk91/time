# Time

Server side codes for Overcast

Frontend repo: https://github.com/williamsk91/clock

# Stack

- Language - [Typescript](https://www.typescriptlang.org/)
- Database - [PostgreSQL](https://www.postgresql.org/)
- Authentication - [OAuth](https://oauth.net/)

# Getting started

The following will set you up for development.

## Installation

First, install dependencies

```
yarn
```

## Environment and Database setup

Create `.env` file with the following credentials

```
NODE_ENV='development'
FRONTEND_HOST=http://localhost:2000

# JWT
JWT_SECRET=

# Google oauth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

```

Also ensure that a local postgres database is created with credentials specified in `ormconfig.js`. i.e.

```
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "time"
```

## Start development

This will also launch GraphQL playground in [http://localhost:4000/graphql](http://localhost:4000/graphql)

```
yarn dev
```

# Graphql documentation

After running development locally API docs can be accessed on `http://localhost:4000/graphql`.

To authorize:

1. Sign in locally
2. Change GraphQL Playground setting `request.credentials` from "omit" to "include"

# Database

We use [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/). See `src/entity` folder for more.

## DB Migrations

Refer to [TypeORM migration](https://typeorm.io/#/migrations) for more information.

### Migration file

Generate migration file with

```
yarn typeorm migration:generate -n "<name>"
```

### Run migration

Execute pending migrations with

```
yarn typeorm migration:run
```

### Revertin migration

Revert latest migration with

```
yarn typeorm migration:revert
```

# Authentication

We use [OAuth](https://oauth.net/) + [JWT](https://jwt.io/) for authentication with the client. Currently, only Google strategy is set up. see `src/authentication` for more.

# Deployment

## Staging

`staging` branch is automatically deployed to [Heroku](https://www.heroku.com/home) with the database done using [Heroku PostgreSQL add-ons](https://elements.heroku.com/addons/heroku-postgresql).

endpoint: https://overcast-staging.herokuapp.com/

## Production

`master` branch is automatically deployed to [Heroku](https://www.heroku.com/home) with the database done using [Heroku PostgreSQL add-ons](https://elements.heroku.com/addons/heroku-postgresql).

endpoint: https://time.overcast.life
