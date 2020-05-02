import { authChecker } from "../authorization/authChecker";
import { buildSchema } from "type-graphql";

export const createSchema = async () =>
  await buildSchema({
    resolvers: [__dirname + "/../resolvers/*.ts"],
    authChecker,
    emitSchemaFile: true
  });
