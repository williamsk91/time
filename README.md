# Time

Server side codes for Overcast

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
FRONTEND_HOST=http://localhost:3000

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
  database: "ink-db"
```

## Start development

This will also launch GraphQL playground in [http://localhost:4000/graphql](http://localhost:4000/graphql)

```
yarn dev
```

# Database

We use [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/). See `src/entity` folder for more.

# Authentication

We use [OAuth](https://oauth.net/) + [JWT](https://jwt.io/) for authentication with the client. Currently, only Google strategy is set up. see `src/authentication` for more.

# Deployment

Master branch is automatically deployed to [Heroku](https://www.heroku.com/home) with the database done using [Heroku PostgreSQL add-ons](https://elements.heroku.com/addons/heroku-postgresql).
