import { authChecker } from "../authorization/authChecker";
import { buildSchema } from "type-graphql";

export const createSchema = async () =>
  await buildSchema({
    resolvers: [
      __dirname + "/../resolvers/*.ts",
      __dirname + "/../resolvers/*.js",
    ],
    authChecker,
    emitSchemaFile: process.env.NODE_ENV !== "production",
  });
