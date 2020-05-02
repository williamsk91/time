import { GraphQLSchema, graphql } from "graphql";
import { mockRequest, mockResponse } from "mock-req-res";

import { AuthorizedContext } from "../authorization/authChecker";
import { Maybe } from "type-graphql";
import { createSchema } from "../graphql/schema";
import { createUser } from "../resolvers/user";

interface Options {
  source: string;
  variableValues?: Maybe<{
    [key: string]: any;
  }>;
  context?: AuthorizedContext;
}

let defaultContext: AuthorizedContext;
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
    const req = mockRequest();
    const res = mockResponse();
    defaultContext = { user: { id: user.id }, req, res };
  }

  return graphql({
    schema,
    source,
    variableValues,
    contextValue: context ?? defaultContext
  });
};
