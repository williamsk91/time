import { GraphQLSchema, graphql } from "graphql";

import { Context } from "../server";
import { Maybe } from "type-graphql";
import { createSchema } from "../graphql/schema";
import { createUser } from "../resolvers/user";

interface Options {
  source: string;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
  context?: Context;
}

let defaultContext: Context;
let schema: GraphQLSchema;

/**
 * Utility function to make graphql query / mutation call.
 */
export const gCall = async ({ source, variableValues, context }: Options) => {
  if (!schema) {
    schema = await createSchema();
  }

  if (!context && !defaultContext) {
    const user = await createUser({ email: "testUserEmail" });
    defaultContext = { user: { id: user.id } };
  }

  return graphql({
    schema,
    source,
    variableValues,
    contextValue: context ?? defaultContext
  });
};
