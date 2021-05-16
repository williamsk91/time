import { buildSchema } from "type-graphql";

import { authChecker } from "../authorization/authChecker";

export const createSchema = async () =>
  await buildSchema({
    resolvers: [
      __dirname + "/../resolvers/*.ts",
      __dirname + "/../resolvers/*.js",
    ],
    // no validations set currently. Remove this line when validations are added.
    validate: false,
    authChecker,
    emitSchemaFile: process.env.NODE_ENV === "development",
  });
